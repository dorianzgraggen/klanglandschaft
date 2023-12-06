uniform sampler2D u_debug_height;
uniform sampler2D u_height;

varying vec2 v_uv;
varying vec3 v_world_pos;
varying vec4 v_vert_pos;

void main()
{
    v_uv = uv;

    float height = texture2D(u_height, v_uv).x;

    vec3 new_pos = position;

    new_pos.z = height * (3000.0 - 400.0) * 0.01;


    v_vert_pos = projectionMatrix * viewMatrix * modelMatrix * vec4(new_pos, 1.0);
    v_world_pos = (modelMatrix * vec4(new_pos, 1.0)).xyz;
    gl_Position = v_vert_pos;
}
