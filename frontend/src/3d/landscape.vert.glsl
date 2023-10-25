uniform sampler2D u_debug_height;
uniform sampler2D u_height;

varying vec2 v_uv;

void main()
{
    v_uv = uv;

    float height = texture2D(u_height, v_uv).x;

    vec3 new_pos = position;

    new_pos.y = height * 10.0;

    vec4 vert_pos = projectionMatrix * viewMatrix * modelMatrix * vec4(new_pos, 1.0);
    gl_Position = vert_pos;
}
