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

vec4 toLinear(vec4 sRGB)
{
    bvec4 cutoff = lessThan(sRGB, vec4(0.04045));
    vec4 higher = pow((sRGB + vec4(0.055))/vec4(1.055), vec4(2.4));
    vec4 lower = sRGB/vec4(12.92);

    return mix(higher, lower, cutoff);
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

  vec4 color_fog = mix(satellite, fromLinear(vec4(u_background, 1.0)), fog_mask);

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
    color_fog.r = noise.r * 3.0;
    gl_FragColor = color_fog;
    // gl_FragColor = vec4(height, 1.0);
  }
}   
