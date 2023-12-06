// precision highp float;
// precision highp int;
// precision highp sampler2DArray;

uniform sampler2D u_height;
uniform sampler2D u_satellite;
uniform sampler2D u_nrm;
uniform sampler2D u_noise;
uniform sampler2D u_wind;
uniform sampler2D u_railway;
uniform sampler2D u_forest;
uniform sampler2D u_water;
uniform sampler2D u_buildings;
uniform vec3 u_center;
uniform vec3 u_background;
uniform bool u_data_mode;
uniform float u_time;

varying vec2 v_uv;
varying vec3 v_world_pos;
varying vec4 v_vert_pos;

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


// https://www.shadertoy.com/view/ldB3zc
float hash1( float n ) { return fract(sin(n)*43758.5453); }
// https://www.shadertoy.com/view/ldB3zc
vec2  hash2( vec2  p ) { p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) ); return fract(sin(p)*43758.5453); }

// https://www.shadertoy.com/view/ldB3zc
vec4 voronoi( in vec2 x, float smoothness, float speed )
{
    vec2 n = floor( x );
    vec2 f = fract( x );

	vec4 m = vec4( 8.0, 0.0, 0.0, 0.0 );
    for( int j=-2; j<=2; j++ )
    for( int i=-2; i<=2; i++ )
    {
        vec2 g = vec2( float(i),float(j) );
        vec2 o = hash2( n + g );
		
		// animate
        o = 0.5 + 0.5*sin( u_time * speed + 6.2831*o );

        // distance to cell		
		float d = length(g - f + o);
		
        // cell color
		vec3 col = 0.5 + 0.5*sin( hash1(dot(n+g,vec2(7.0,113.0)))*2.5 + 3.5 + vec3(2.0,3.0,0.0));
        // in linear space
        col = col*col;
        
        // do the smooth min for colors and distances		
		float h = smoothstep( -1.0, 1.0, (m.x-d)/smoothness );
	    m.x   = mix( m.x,     d, h ) - h*(1.0-h)*smoothness/(1.0+3.0*smoothness); // distance
		m.yzw = mix( m.yzw, col, h ) - h*(1.0-h)*smoothness/(1.0+3.0*smoothness); // color
    }
	
	return m;
}

vec3 mix3(vec3 color_a, vec3 color_b, vec3 color_c, float t)  {
  float t1 = clamp(t * 2.0, 0.0, 1.0);
  float t2 = clamp(t * 2.0 - 1.0, 0.0, 1.0);

  vec3 c1 = mix(color_a, color_b, t1);
  return mix(c1, color_c, t2);
}


// https://www.shadertoy.com/view/MlXGRf
float s_curve(float value, float amount, float correction) {

	float curve = 1.0; 

  if (value < 0.5)
  {
    curve = pow(value, amount) * pow(2.0, amount) * 0.5; 
  }
  else
  { 	
    curve = 1.0 - pow(1.0 - value, amount) * pow(2.0, amount) * 0.5; 
  }

  return pow(curve, correction);
}

void main()
{
  vec3 height = texture2D(u_height, v_uv).xyz;
  vec4 noise = texture2D(u_noise, v_uv);
  vec4 wind = texture2D(u_wind, v_uv);
  vec4 railway = texture2D(u_railway, v_uv);
  vec4 water = texture2D(u_water, v_uv, 3.0);
  vec4 forest = texture2D(u_forest, v_uv, 3.0);
  vec4 satellite = texture2D(u_satellite, v_uv);
  vec4 buildings = texture2D(u_buildings, v_uv, 1.0);

  vec2 screen_coords = v_vert_pos.xy / v_vert_pos.w * 0.5 + 0.5;

  float dist = distance(v_world_pos.xz, u_center.xz);

  float inner_width = 16.0;
  float gradient_width = 3.0;

  float mask = (dist - inner_width) / gradient_width;
  mask = clamp(mask, 0.0, 1.0);

  vec4 color = mix(satellite, fromLinear(vec4(u_background, 1.0)), mask);

  float fog_mask = (distance(v_world_pos, cameraPosition) - 30.0) * 0.01;
  fog_mask = clamp(fog_mask, 0.0, 1.0);

  vec3 tinted = desaturate(satellite.rgb, 1.0) * vec3(0.0, 0.1, 0.2) * 1.3;
  vec3 color_fog = mix(tinted, fromLinear(vec4(u_background, 1.0)).xyz, fog_mask);

  // vec3 noise_levels_colored = mix(vec3(0.8, 0.1, 0.1), vec3(0.8, 0.4, 0.2), (noise.r * 3.0) - 0.2) * noise.a;
  float noise_mapped = (noise.r - 0.18) * 6.6;
  vec3 noise_levels_colored = mix3(vec3(0.0, 0.0, 0.0), vec3(0.8, 0.1, 0.1), vec3(0.8, 0.6, 0.2) * 7.0, noise_mapped);

  float wind_mapped = pow((wind.r - 0.34) * 1.8, 1.9);
  vec3 wind_colored = mix3(vec3(0.0, 0.0, 0.0), vec3(0.6, 0.2, 0.8) * 0.5, vec3(0.5, 0.1, 0.9) * 6.0, wind_mapped);

  vec4 v = voronoi(v_world_pos.xz * vec2(4.5), 0.5, 0.5);
  vec3 forest_colored = vec3(0.2, 0.6, 0.2) * forest.r * 0.16 * (1.0 - v.r);

  vec4 voronoi_water = voronoi(v_world_pos.xz * vec2(1.0), 1.0, 0.8);
  float voronoi_water_lines = pow(max(0.0, voronoi_water.r - 0.1), 1.5) * 0.2;
  voronoi_water_lines = max(voronoi_water_lines, 0.0);

  vec4 voronoi_water2 = voronoi(v_world_pos.xz * vec2(2.5), 1.0, 0.8);
  float voronoi_water_lines2 = pow(max(0.0, voronoi_water2.r - 0.5), 2.2) * 0.8;
  voronoi_water_lines2 = max(voronoi_water_lines2, 0.0);


  vec3 water_colored = vec3(0.2, 0.3, 0.9) * water.r * 0.2 * voronoi_water_lines;
  water_colored = water_colored + vec3(0.2, 0.3, 0.9) * water.r * 0.13 * voronoi_water_lines2;

  vec3 buildings_colored = vec3(0.7, 0.9, 0.2) * buildings.r * 0.3;
  // vec3 buildings_colored = vec3(0.45, 0.65, 0.9) * buildings.r * 0.3;


  gl_FragColor = vec4(v_world_pos, 1.0);
  gl_FragColor = vec4(vec3(mask), 1.0);
  gl_FragColor = vec4(height, 1.0);
  gl_FragColor = color;
  gl_FragColor = vec4(vec3(fog_mask), 1.0);
  gl_FragColor = satellite;
  if (u_data_mode) {
    gl_FragColor = (vec4(height, 0.7));
    gl_FragColor = vec4(height.x, noise_mapped, wind_mapped, 1.0);
  } else {
    // color_fog.r = noise.r * 3.0;
    color_fog += noise_levels_colored;
    vec3 col = tinted
      + noise_levels_colored
      + wind_colored
      + vec3(0.7 * min(railway.r, 1.0 - buildings.r)) * vec3(0.5, 0.5, 0.8)
      + forest_colored
      + water_colored
      + buildings_colored;


    float vignette = 1.0 - distance(vec2(0.5), screen_coords) * 1.2;
    col = col * mix(0.04, 1.0, clamp(s_curve(vignette, 2.2, 1.0), 0.0, 1.0));


    col = mix(tanh(col), tonemap_agx(col), 0.82);

    vec3 pos_a = abs((v_world_pos-u_center) * 0.05);

    // if (pos_a.x > 1.0) {
    //   discard;
    // }


    // if (pos_a.z > 1.0) {
    //   discard;
    // }



    gl_FragColor = vec4(col * 1.1, 1.0);
    // gl_FragColor = vec4(vec3(vignette), 1.0);

// gl_FragColor = forest;

    // gl_FragColor = vec4(v_world_pos.xz * vec2(0.1), 0.0, 1.0);

    // gl_FragColor = v;
    // gl_FragColor = vec4(v.r);

    // gl_FragColor = vec4(mod(u_time, 1.0), 0.0, 0.0, 1.0);

    // gl_FragColor = vec4(vec3(wind_mapped), 1.0);

    // gl_FragColor = vec4(distance(u_center, v_world_pos), 0.0, 0.0, 1.0);
    // gl_FragColor = vec4(pos_a.x, pos_a.z, 0.0, 1.0);
    // gl_FragColor = vec4(noise_levels_colored, 1.0);
    // gl_FragColor = vec4(vec3(noise.r * 3.0), 1.0);
    // gl_FragColor = vec4(height, 1.0);
  }
}   
