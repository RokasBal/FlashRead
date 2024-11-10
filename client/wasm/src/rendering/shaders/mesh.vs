R"(#version 300 es
precision mediump float;

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in uint materialId;

layout(std140) uniform CameraUniform {
    mat4 projxview;
    vec2 nearFarPlane;
};

layout(std140) uniform ModelMatricesUniform {
    mat4 model[<<MODELS_PER_UBO>>];
};

out vec3 u_normal;
flat out vec3 u_highlightColor;
flat out uint u_materialId;

void main() {
    mat4 currentModel = model[gl_InstanceID];
    // revert highlight color
    u_highlightColor = vec3(currentModel[0][3], currentModel[1][3], currentModel[2][3]);
    currentModel[0][3] = 0.0;
    currentModel[1][3] = 0.0;
    currentModel[2][3] = 0.0;

    u_normal = transpose(inverse(mat3(currentModel))) * normal;
    u_materialId = materialId;

    gl_Position = projxview * currentModel * vec4(position, 1.0);
}
)"