R"(#version 300 es
precision mediump float;
out vec4 gColor;

uniform sampler2D tPosition;
uniform sampler2D tColor;
uniform sampler2D tNormal;

layout(std140) uniform LightingInfo {
    vec3 lightPos;
    vec3 cameraPos;
    vec2 viewportSize;
};

in vec2 uv;

vec3 getColor();
float getOutline();

void main() {
    vec3 color = getColor();

    vec3 outlineColor = vec3(0);
    color = mix(color, outlineColor, getOutline());

    gColor = vec4(color, 1.0f);
}

vec3 getColor() {
    vec3 position = texture(tPosition, uv).rgb;
    vec3 color = texture(tColor, uv).rgb;
    vec3 normal = texture(tNormal, uv).rgb;

    if (length(normal) < 0.8) {
        return color;
    }

    float ambient = 0.08;

    // vec3 lightDir = normalize(lightPos - position);
    vec3 lightDir = normalize(vec3(1000, 2000, -800) - position);
    float diffuse = max(dot(lightDir, normal), 0.0);

    vec3 viewDir = normalize(cameraPos - position);
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 halfwayDir = normalize(lightDir + viewDir);  
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);
    spec *= 0.0;

    float strength = ambient + diffuse + spec;
    strength = floor(strength * 5.0) / 6.0 + 0.3;
    color *= strength;

    return color;
}

float sobel(mat3 vars) {
    mat3 sobelY = mat3( 
        1.0, 0.0, -1.0, 
        2.0, 0.0, -2.0, 
        1.0, 0.0, -1.0 
    );
    mat3 sobelX = mat3( 
        1.0, 2.0, 1.0, 
        0.0, 0.0, 0.0, 
        -1.0, -2.0, -1.0 
    );
    float gx = dot(sobelX[0], vars[0]) + dot(sobelX[1], vars[1]) + dot(sobelX[2], vars[2]); 
    float gy = dot(sobelY[0], vars[0]) + dot(sobelY[1], vars[1]) + dot(sobelY[2], vars[2]);
    return sqrt(gx * gx + gy * gy);
}

float getOutline() {
    vec3 normal = texture(tNormal, uv).rgb;
    float depth = texture(tPosition, uv).w;
    vec2 stepDist = max(0.5, 2.0 - depth / 40.0) / viewportSize;

    mat3 sobelPositions;
    mat3 sobelNormals;
    for (int x = 0; x < 3; x++) {
        for (int y = 0; y < 3; y++) {
            // I dont understand why position buffer works so well here.
            // Discovered by accident. should have been normal buffer.
            sobelPositions[x][y] = dot(normal, texture(tPosition, uv + vec2(x, y) * stepDist - stepDist).xyz);
            sobelNormals[x][y] = dot(normal, texture(tNormal, uv + vec2(x, y) * stepDist - stepDist).xyz);
        }
    }
    float positionG = sobel(sobelPositions);
    if (positionG < 1.0) positionG = 0.0;
    else positionG = 1.0;
    // positionG *= 0.0;

    float normalG = sobel(sobelNormals);
    if (normalG < 1.0) normalG = 0.0;
    else normalG = 1.0;
    // normalG *= 0.0;

    float g = positionG + normalG;
    return g;
}

)"