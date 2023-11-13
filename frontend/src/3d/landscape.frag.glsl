
// precision highp float;
// precision highp int;
// precision highp sampler2DArray;

uniform sampler2D u_height;
uniform sampler2D u_satellite;
uniform sampler2D u_nrm;
uniform sampler2D u_noise;
uniform vec3 u_center;
uniform vec3 u_background;
uniform bool u_data_mode;

varying vec2 v_uv;
varying vec3 v_world_pos;
varying vec4 v_gl_pos;


// https://gamedev.stackexchange.com/a/148088
vec4 fromLinear(vec4 linearRGB)
{
    bvec3 cutoff = lessThan(linearRGB.rgb, vec3(0.0031308));
    vec3 higher = vec3(1.055)*pow(linearRGB.rgb, vec3(1.0/2.4)) - vec3(0.055);
    vec3 lower = linearRGB.rgb * vec3(12.92);

    return vec4(mix(higher, lower, cutoff), linearRGB.a);
}

// https://gamedev.stackexchange.com/a/148088
vec4 toLinear(vec4 sRGB)
{
    bvec4 cutoff = lessThan(sRGB, vec4(0.04045));
    vec4 higher = pow((sRGB + vec4(0.055))/vec4(1.055), vec4(2.4));
    vec4 lower = sRGB/vec4(12.92);

    return mix(higher, lower, cutoff);
}

// https://www.shadertoy.com/view/mdcSDH
vec3 agxDefaultContrastApprox(vec3 x) {
  vec3 x2 = x * x;
  vec3 x4 = x2 * x2;
  
  return + 15.5     * x4 * x2
         - 40.14    * x4 * x
         + 31.96    * x4
         - 6.868    * x2 * x
         + 0.4298   * x2
         + 0.1191   * x
         - 0.00232;
}

// https://www.shadertoy.com/view/mdcSDH
vec3 agx(vec3 val) {
  const mat3 agx_mat = mat3(
    0.842479062253094, 0.0423282422610123, 0.0423756549057051,
    0.0784335999999992,  0.878468636469772,  0.0784336,
    0.0792237451477643, 0.0791661274605434, 0.879142973793104);
  const float minEv = -12.47393f;
  const float maxEv = 4.026069f;

  // Input transform
  val = agx_mat * val;
  
  // Log2 space encoding
  val = clamp(log2(val), minEv, maxEv);
  val = (val - minEv) / (maxEv - minEv);
  
  // Apply sigmoid function approximation
  val = agxDefaultContrastApprox(val);

  return val;
}

// https://www.shadertoy.com/view/mdcSDH
vec3 inv_agx(vec3 val) {
  const mat3 inv_agx_mat = inverse(mat3(
    0.842479062253094, 0.0423282422610123, 0.0423756549057051,
    0.0784335999999992,  0.878468636469772,  0.0784336,
    0.0792237451477643, 0.0791661274605434, 0.879142973793104));

  // Input transform
  val = inv_agx_mat * val;

  return val;
}

// https://www.shadertoy.com/view/mdcSDH
vec3 agxLook(vec3 val) {
  const vec3 lw = vec3(0.2126, 0.7152, 0.0722);
  float luma = dot(val, lw);
  
  vec3 offset = vec3(0.0);

  vec3 slope = vec3(1.0, 0.9, 0.9);
  vec3 power = vec3(1.55);
  float sat = 1.4;
  
  // Default
  // vec3 slope = vec3(1.0);
  // vec3 power = vec3(1.0);
  // float sat = 1.0;
  
  // ASC CDL
  val = pow(val * slope + offset, power);
  return luma + sat * (val - luma);
}

// https://www.shadertoy.com/view/mdcSDH
vec3 tonemap_agx(vec3 color) {
  return inv_agx(agxLook(agx(color)));
}

// https://www.shadertoy.com/view/lslGzl
vec3 filmicToneMapping(vec3 color)
{
	color = max(vec3(0.), color - vec3(0.004));
	color = (color * (6.2 * color + .5)) / (color * (6.2 * color + 1.7) + 0.06);
	return color;
}

vec3 Uncharted2ToneMapping(vec3 color)
{
	float A = 0.15;
	float B = 0.50;
	float C = 0.10;
	float D = 0.20;
	float E = 0.02;
	float F = 0.30;
	float W = 11.2;
	float exposure = 2.;
	color *= exposure;
	color = ((color * (A * color + C * B) + D * E) / (color * (A * color + B) + D * F)) - E / F;
	float white = ((W * (A * W + C * B) + D * E) / (W * (A * W + B) + D * F)) - E / F;
	color /= white;
	color = pow(color, vec3(1. / 2.2));
	return color;
}


// https://www.shadertoy.com/view/lsdXDH
vec3 desaturate(vec3 color, float factor)
{
	vec3 lum = vec3(0.299, 0.587, 0.114);
	vec3 gray = vec3(dot(lum, color));
	return mix(color, gray, factor);
}

vec3 mix3(vec3 color_a, vec3 color_b, vec3 color_c, float t)  {
  float t1 = clamp(t * 2.0, 0.0, 1.0);
  float t2 = clamp(t * 2.0 - 1.0, 0.0, 1.0);

  vec3 c1 = mix(color_a, color_b, t1);
  return mix(c1, color_c, t2);
}

// https://gist.github.com/yiwenl/745bfea7f04c456e0101
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


void main()
{
  vec3 blue = hsv2rgb(vec3(0.6, 0.6, 0.2));
  vec3 blue_light = hsv2rgb(vec3(0.6, 0.7, 0.1));

  vec3 height = texture2D(u_height, v_uv).xyz;
  vec4 noise = texture2D(u_noise, v_uv);
  vec4 satellite = texture2D(u_satellite, v_uv);

  float dist = distance(v_world_pos.xz, u_center.xz);

  float inner_width = 16.0;
  float gradient_width = 3.0;

  float mask = (dist - inner_width) / gradient_width;
  mask = clamp(mask, 0.0, 1.0);

  vec4 color = mix(satellite, fromLinear(vec4(u_background, 1.0)), mask);

  float fog_mask = (distance(v_world_pos, cameraPosition) - 30.0) * 0.01;
  fog_mask = clamp(fog_mask, 0.0, 1.0);

  vec3 tinted = desaturate(satellite.rgb, 1.0) * blue * 1.3;
  vec3 color_fog = mix(tinted, fromLinear(vec4(u_background, 1.0)).xyz, fog_mask);

  // vec3 noise_levels_colored = mix(vec3(0.8, 0.1, 0.1), vec3(0.8, 0.4, 0.2), (noise.r * 3.0) - 0.2) * noise.a;
  float noise_mapped = (noise.r - 0.18) * 6.6;
  vec3 noise_levels_colored = mix3(vec3(0.0, 0.0, 0.0), vec3(0.8, 0.1, 0.1), vec3(0.8, 0.6, 0.2) * 7.0, noise_mapped);

  gl_FragColor = vec4(v_world_pos, 1.0);
  gl_FragColor = vec4(vec3(mask), 1.0);
  gl_FragColor = vec4(height, 1.0);
  gl_FragColor = color;
  gl_FragColor = vec4(vec3(fog_mask), 1.0);
  gl_FragColor = satellite;
  if (u_data_mode) {
    gl_FragColor = (vec4(height, 0.7));
    gl_FragColor = vec4(height.x, noise_mapped, 0.0, 1.0);
  } else {
    // color_fog.r = noise.r * 3.0;
    color_fog += noise_levels_colored;
    vec3 col = tinted + noise_levels_colored;
    // col = tonemap_agx(col);


    vec3 pos_a = abs((v_world_pos-u_center) * 0.05);
    vec3 pos = ((v_world_pos-u_center) * 0.05);

    vec4 bg = vec4(1.0, 0.8, 0.8, 1.0);

    float border = 0.01;


    vec2 vCoords = v_gl_pos.xy;
		vCoords /= v_gl_pos.w;
		vCoords = vCoords * 0.5 + 0.5;
  
  	vec2 uv = fract( vCoords * 10.0 );

    if (-pos.x > 1.0) {
      discard;
    }

    if (-pos.z > 1.0) {
      discard;
    }


    gl_FragColor = vec4(col * 1.1, 1.0);



    bg = vec4(vCoords.x, 0.0, 0.0, 1.0);

    float g = 0.23;
    if (vCoords.x < g) {
      discard;
    }

    if (vCoords.x > 1.0 - g) {
      discard;
    }

    // if (vCoords.x + )

    //bg = ;

    vec3 base = vec3(0.3);
    if (vCoords.x > 0.5) {
      base = vec3(0.2);
    }

    bg = vec4(base, 1.0);

    float gradient_left = vCoords.y + vCoords.x;
    float gradient_right = vCoords.y + (1.0 - vCoords.x);

    float gradient = gradient_left;
    if (vCoords.x > 0.5) {
      gradient = gradient_right;
    }

    bg = vec4(vec3(gradient), 1.0);

    vec3 t = vec3(gradient * base) * blue * 2.6;
    bg = vec4(t, 1.0);


    float gap = 0.012;
    float m = 1.0 - gap;

    if (pos.z > m) {
      gl_FragColor = gl_FragColor + vec4(blue_light, 0.0);
    }

    if (pos.x > m) {
      gl_FragColor = gl_FragColor + vec4(blue_light, 0.0);
    }

    if (pos.z < -m) {
      gl_FragColor = gl_FragColor + vec4(blue_light, 0.0);
    }

    if (pos.x < -m) {
      gl_FragColor = gl_FragColor + vec4(blue_light, 0.0);
    }

    if (vCoords.x < g + 0.0016) {
      bg += vec4(blue_light, 0.0);
    }

    if (vCoords.x > 1.0 - (g + 0.0016)) {
      bg += vec4(blue_light, 0.0);
    }

    if (vCoords.x > 0.5 - 0.5 * 0.0016) {
      if (vCoords.x < 0.5 + 0.5 * 0.0016) {
        bg += vec4(blue_light, 0.0);
      }
    }



    if (pos.z > 1.0) {
      gl_FragColor = bg;
    }


    if (pos.x > 1.0) {
      gl_FragColor = bg;
    }


    gl_FragColor = vec4(tonemap_agx(gl_FragColor.rgb), 1.0);

    // gl_FragColor = vec4(vCoords.xxx, 1.0);

    // if (vCoords.x > 0.5) {
    //   gl_FragColor = vec4(1.0, 0.0, 0.0 ,1.0);
    // }



    // gl_FragColor = vec4(distance(u_center, v_world_pos), 0.0, 0.0, 1.0);
    // gl_FragColor = vec4(pos_a.x, pos_a.z, 0.0, 1.0);
    // gl_FragColor = vec4(noise_levels_colored, 1.0);
    // gl_FragColor = vec4(vec3(noise.r * 3.0), 1.0);
    // gl_FragColor = vec4(height, 1.0);
  }
}   
