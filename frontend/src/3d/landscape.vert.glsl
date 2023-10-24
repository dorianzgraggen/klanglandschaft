uniform sampler2D u_height;

varying vec2 v_uv;

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

    float height = texture2D(u_height, uv).x;


    vec3 new_pos = position;

    new_pos.y = height * 13.0;

    vec4 vert_pos = projectionMatrix * viewMatrix * modelMatrix * vec4(new_pos, 1.0);
    gl_Position = vert_pos;
}
