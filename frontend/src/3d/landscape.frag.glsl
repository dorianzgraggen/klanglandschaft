// precision highp float;
// precision highp int;
// precision highp sampler2DArray;

uniform sampler2D u_height;
uniform sampler2D u_debug;
uniform sampler2D u_debug_height;
uniform sampler2D u_nrm;
uniform vec2 u_resolution;

varying vec2 fixed_uv;
varying vec2 v_uv;

// https://www.shadertoy.com/view/3sSSW1
vec2 normal_from_height(in vec2 uv) 
{
  vec2 ratio = u_resolution / vec2(512.0, 512.0); 
  float height = texture(u_height, uv).r;
  return -vec2(dFdx(height), dFdy(height)) * ratio;
}


void main()
{
  vec3 height = texture2D(u_height, fixed_uv).xyz;
  vec3 normal2 = texture2D(u_nrm, v_uv * 510.0 / 512.0).xyz;

  vec2 normal = normal_from_height(fixed_uv);
  
  normal *= 6.0;
  normal += 0.5;

  float half_pixel = 1.0 / 64.0 / 2.0;

  vec2 new_uv = v_uv * 63.5 / 64.0 - vec2(0.0);
  vec4 debug = texture2D(u_debug, fixed_uv);

  gl_FragColor = vec4(height, 1.0);
  // gl_FragColor = debug;
  // gl_FragColor = vec4(normal, 0.0, 1.0);
  // gl_FragColor = vec4(fixed_uv, 0.0, 1.0);

}   
