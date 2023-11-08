// precision highp float;
// precision highp int;
// precision highp sampler2DArray;

uniform sampler2D u_height;
uniform sampler2D u_satellite;
uniform vec3 u_center;
uniform vec3 u_background;

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

void main()
{
  vec3 height = texture2D(u_height, v_uv).xyz;
  vec4 satellite = texture2D(u_satellite, v_uv);

  float fog_mask = (distance(v_world_pos, cameraPosition) - 30.0) * 0.01;
  fog_mask = clamp(fog_mask, 0.0, 1.0);

  vec4 color_fog = mix(satellite, fromLinear(vec4(u_background, 1.0)), fog_mask);

  gl_FragColor = color_fog;
}   
