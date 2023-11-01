// precision highp float;
// precision highp int;
// precision highp sampler2DArray;

uniform sampler2D u_height;
uniform sampler2D u_satellite;
uniform sampler2D u_nrm;
uniform vec2 u_resolution;

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
  vec3 height = texture2D(u_height, v_uv).xyz;
  vec4 satellite = texture2D(u_satellite, v_uv);
  gl_FragColor = vec4(height, 1.0);
  gl_FragColor = satellite;
}   
