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

void main()
{
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

  vec3 tinted = desaturate(satellite.rgb, 1.0) * vec3(0.0, 0.1, 0.2) * 1.6;
  vec3 color_fog = mix(tinted, fromLinear(vec4(u_background, 1.0)).xyz, fog_mask);

  // vec3 noise_levels_colored = mix(vec3(0.8, 0.1, 0.1), vec3(0.8, 0.4, 0.2), (noise.r * 3.0) - 0.2) * noise.a;
  vec3 noise_levels_colored = mix3(vec3(0.0, 0.0, 0.0), vec3(0.8, 0.1, 0.1), vec3(0.8, 0.8, 0.2) * 3.0, (noise.r - 0.19) * 6.6);

  gl_FragColor = vec4(v_world_pos, 1.0);
  gl_FragColor = vec4(vec3(mask), 1.0);
  gl_FragColor = vec4(height, 1.0);
  gl_FragColor = color;
  gl_FragColor = vec4(vec3(fog_mask), 1.0);
  gl_FragColor = satellite;
  if (u_data_mode) {
    gl_FragColor = (vec4(height, 0.7));
    gl_FragColor = noise;
  } else {
    // color_fog.r = noise.r * 3.0;
    color_fog += noise_levels_colored;
    gl_FragColor = vec4(color_fog, 1.0);
    // gl_FragColor = vec4(noise_levels_colored, 1.0);
    // gl_FragColor = vec4(vec3(noise.r * 3.0), 1.0);
    // gl_FragColor = vec4(height, 1.0);
  }
}   
