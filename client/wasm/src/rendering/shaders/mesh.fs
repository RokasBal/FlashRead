R"(#version 300 es
precision mediump float;

layout (location = 0) out vec4 gColor;
layout (location = 1) out vec4 gNormal;

in vec3 u_normal;
flat in vec3 u_highlightColor;
flat in uint u_materialId;

void main() {
    gColor = vec4(u_highlightColor, float(u_materialId));
    gNormal = vec4(normalize(u_normal), 1.0);
}
)"