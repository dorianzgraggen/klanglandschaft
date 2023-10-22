// precision highp float;
// precision highp int;
// precision highp sampler2DArray;

uniform sampler2D u_height;

varying vec2 v_uv;


void main()
{
  vec3 height = texture2D(u_height, v_uv).xyz;

  // gl_FragColor = vec4(height, 0.0, 0.0, 1.0);
  gl_FragColor = vec4(v_uv.x, v_uv.y, 0.0, 1.0);
  gl_FragColor = vec4(0.7, 0.3, 0.5, 1.0);
  gl_FragColor = vec4(height, 1.0);
}   
