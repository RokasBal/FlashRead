R"(#version 300 es
precision mediump float;

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in uint materialId;

layout(std140) uniform CSMUniform {
    mat4 lightSpaceMatrices[<<MAX_FRUSTUMS>>];
};

layout(std140) uniform ModelMatricesUniform {
    mat4 model[<<MODELS_PER_UBO>>];
};

void main() {
    gl_Position = lightSpaceMatrices[<<FRUSTUM_INDEX>>] * model[gl_InstanceID] * vec4(position, 1.0);
}
)"