varying vec2 v_uv;
varying vec3 v_world_pos;
varying vec3 v_pos;
varying vec3 v_normal;

void main()
{
    v_uv = uv;
    vec4 vert_pos = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    v_world_pos = (modelMatrix * vec4(position, 1.0)).xyz;
    v_pos = position;
    v_normal = normal;
    gl_Position = vert_pos;
}
