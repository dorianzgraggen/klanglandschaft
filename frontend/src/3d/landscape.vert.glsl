uniform sampler2D u_debug_height;
uniform sampler2D u_height;

varying vec2 v_uv;
varying vec2 fixed_uv;

void main()
{
    v_uv = uv;

    vec2 uvb = v_uv * 510.0 / 512.0 + vec2(1.0 / 512.0 * 0.5);


    float b = 0.996;
    float a = 0.002;
    // float u = mix(a, b, uv.x);
    float u = mix(0.5/512.0, 510.5/512.0, uv.x);
    // float v = mix(a, b, uv.y);
    float v = mix(0.5/512.0, 510.5/512.0, uv.y);
    vec2 uvc = vec2(u, v);



    fixed_uv = uv * 63.5 / 64.0 - vec2(0.0);
    fixed_uv = uv * 511.5 / 1024.0 + vec2(0.5 / 1024.0);
    fixed_uv = uv / (65.0 / 64.0) + (1.0/64.0/2.0);
    fixed_uv = uv;


    float height = texture2D(u_height, fixed_uv).x;

    vec3 new_pos = position;

    new_pos.y = height * 10.0;

    vec4 vert_pos = projectionMatrix * viewMatrix * modelMatrix * vec4(new_pos, 1.0);
    gl_Position = vert_pos;
}
