
// precision highp float;
// precision highp int;
// precision highp sampler2DArray;

varying vec2 v_uv;
varying vec3 v_world_pos;
varying vec3 v_pos;
varying vec3 v_normal;


void main()
{
  vec3 normal = abs(v_normal);
  vec3 pos = v_pos * 0.05;

  vec3 abs_pos = abs(pos - vec3(0.0));

  float b = 0.0;

  float line_width = 0.03;
  float edge = 0.3;

  float q = 1.0 - line_width;
  float r = 1.0 - edge;

  if (abs_pos.y > q) 
  {
    b = 1.0;
    if (abs_pos.x < r) {
      b = 0.0;
    }

    if (abs_pos.z < r) {
      b = 0.0;
    }
  }

  float c = 0.0;
  if (abs_pos.x < q) {
    if (abs_pos.z < q) {
      c = 1.0;
    }
  }


  b = 0.0;
  if (abs_pos.x > q) {
    if (normal.x < 1.0) {
      b = 1.0;
    }
  }


  if (abs_pos.z > q) {
    if (normal.z < 1.0) {
      b = 1.0;
    }
  }

  if (abs_pos.y > q) {
    if (normal.y < 1.0) {
      b = 1.0;
    }
  }

  float g = 0.0;

  if (abs_pos.x < r) {
    g = 1.0;
  }

  if (abs_pos.z < r) {
    g = 1.0;
  }

  if (abs_pos.y < r) {
    g = 1.0;
  }

  b = b - g;

  // b = b - c;
  
  gl_FragColor = vec4(1.0, 0.0, 0.5, 0.4);
  gl_FragColor = vec4(pos, 1.0);
  gl_FragColor = vec4(abs_pos.x, 0.0, 0.0, 1.0);
  gl_FragColor = vec4(abs_pos, 1.0);
  gl_FragColor = vec4(normal, b);
  gl_FragColor = vec4(vec3(1.0), b * 0.5);
  // gl_FragColor = vec4(vec3(1.0), c);
}   
