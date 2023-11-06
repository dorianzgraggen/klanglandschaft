// precision highp float;
// precision highp int;
// precision highp sampler2DArray;

uniform sampler2D u_height;
uniform sampler2D u_satellite;
uniform sampler2D u_nrm;
uniform vec2 u_resolution;
uniform vec3 u_center;
uniform vec3 u_background;

varying vec2 v_uv;
varying vec3 v_world_pos;

// https://www.shadertoy.com/view/3sSSW1
vec2 normal_from_height(in vec2 uv) 
{
  vec2 ratio = u_resolution / vec2(512.0, 512.0); 
  float height = texture(u_height, uv).r;
  return -vec2(dFdx(height), dFdy(height)) * ratio;
}


vec4 fromLinear(vec4 linearRGB)
{
    bvec3 cutoff = lessThan(linearRGB.rgb, vec3(0.0031308));
    vec3 higher = vec3(1.055)*pow(linearRGB.rgb, vec3(1.0/2.4)) - vec3(0.055);
    vec3 lower = linearRGB.rgb * vec3(12.92);

    return vec4(mix(higher, lower, cutoff), linearRGB.a);
}

void main()
{
  vec3 height = texture2D(u_height, v_uv).xyz;
  vec4 satellite = texture2D(u_satellite, v_uv);

  float dist = distance(v_world_pos.xz, u_center.xz);

  float inner_width = 16.0;
  float gradient_width = 3.0;

  float mask = (dist - inner_width) / gradient_width;
  mask = clamp(mask, 0.0, 1.0);

  vec4 color = mix(satellite, fromLinear(vec4(u_background, 1.0)), mask);

  float fog_mask = (distance(v_world_pos, cameraPosition) - 10.0) * 0.01;
  fog_mask = clamp(fog_mask, 0.0, 1.0);

  vec4 color_fog = mix(satellite, fromLinear(vec4(u_background, 1.0)), fog_mask);

  gl_FragColor = vec4(v_world_pos, 1.0);
  gl_FragColor = vec4(vec3(mask), 1.0);
  gl_FragColor = vec4(height, 1.0);
  gl_FragColor = color;
  gl_FragColor = vec4(vec3(fog_mask), 1.0);
  gl_FragColor = satellite;
  gl_FragColor = color_fog;
}   
