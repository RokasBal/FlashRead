R"(#version 300 es
precision mediump float;
out vec4 gColor;

uniform sampler2D tPosition;
uniform sampler2D tColor;
uniform sampler2D tNormal;
uniform mediump sampler2DArray tShadow;

layout(std140) uniform LightingInfoUniform {
    vec3 sunlightDir;
    vec4 sunlightColor; // rgb-color, a-intensity
    vec3 cameraPos;
    vec2 viewportSize;
};
layout(std140) uniform CSMUniform {
    mat4 lightSpaceMatrices[<<MAX_FRUSTUMS>>];
};
const int cascadeCount = <<CASCADE_COUNT>>;
const float cascadeSplits[<<CASCADE_COUNT>>] = float[](<<CASCADE_SPLITS>>);

struct Material {
    vec4 diffuse;
};
layout(std140) uniform MaterialUniform {
    Material materials[<<MATERIALS_PER_UBO>>];
};
// struct PointLight {    
//     vec3 position;
//     vec3 color;
//     vec3 attenuation; // r-constant, g-linear, b-quadratic
// };  
// layout(std140) uniform PointLightInfo {
//     PointLight pointLights[<<POINT_LIGHT_COUNT>>];
// };
in vec2 uv;

float getSunlight(vec3 position, vec3 normal);
float getShadow(vec3 fragPosWorldSpace, vec3 normal, float depth);
float getOutline(vec3 normal, float depth);

void main() {
    // init values
    vec4 packedPosDepth = texture(tPosition, uv);
    vec3 position = packedPosDepth.xyz;
    float depth = packedPosDepth.w;

    vec3 normal = texture(tNormal, uv).rgb;

    vec4 packedBackgroundMaterial = texture(tColor, uv);
    uint materialId = uint(floor(packedBackgroundMaterial.a + 0.5));
    vec3 backgroundColor = materials[materialId].diffuse.rgb;

    // toon shading
    float lightStrength = getSunlight(position, normal);
    lightStrength = floor(lightStrength * 4.0) / 6.0 + 0.05;
    vec3 color = materials[materialId].diffuse.rgb * sunlightColor.rgb * lightStrength;

    // add shadow
    float shadow = getShadow(position, normal, depth);
    shadow = 1.0 - shadow * 0.8;
    color *= shadow;

    // add outline
    vec3 outlineColor = vec3(0);
    float outline = getOutline(normal, depth);
    color = mix(color, outlineColor, outline);

    // fill background color
    if (length(normal) < 0.8) color = backgroundColor;

    // gamma correction
    float gamma = 2.2;
    color = pow(color, vec3(1.0 / gamma));

    gColor = vec4(color, 1.0f);
}

float getSunlight(vec3 position, vec3 normal) {
    vec3 lightDir = sunlightDir;
    float strength = sunlightColor.a;

    float ambient = strength * 0.05;
    float diffuse = max(dot(lightDir, normal), 0.0);

    // maby later
    // vec3 viewDir = normalize(cameraPos - position);
    // vec3 reflectDir = reflect(-lightDir, normal);
    // vec3 halfwayDir = normalize(lightDir + viewDir);  
    // float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0); 
    
    return (ambient + diffuse) * strength;
}

float getShadow(vec3 fragPosWorldSpace, vec3 normal, float depth) {
    // select cascade layer
    int layer = cascadeCount - 1;
    for (int i = 0; i < cascadeCount; i++) {
        if (depth < cascadeSplits[i]) {
            layer = i;
            break;
        }
    }

    // get frag pos in light space
    vec4 fragPosLightSpace = lightSpaceMatrices[layer] * vec4(fragPosWorldSpace, 1.0);
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    // transform to [0,1] range
    projCoords = projCoords * 0.5 + 0.5;
    float fragDepth = projCoords.z;
    if (fragDepth > 1.0) return 0.0;


    float bias;
    bias = max(0.05 * (1.0 - dot(normal, sunlightDir)), 0.005);
    bias *= 1.0 / (cascadeSplits[layer] * 4.);

    // PCF
    float shadow = 0.0;
    vec2 texelSize = 1.0 / vec2(textureSize(tShadow, 0));
    for(int x = -1; x <= 1; x++) {
        for(int y = -1; y <= 1; y++) {
            float pcfDepth = texture(tShadow, vec3(projCoords.xy + vec2(x, y) * texelSize, layer)).r; 
            shadow += (fragDepth + bias) > pcfDepth ? 1.0 : 0.0;        
        }    
    }
    shadow /= 9.0;

    return shadow;
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

float getOutline(vec3 normal, float depth) {
    vec2 stepDist = max(0.5, 2.0 - depth / 40.0) / viewportSize;

    mat3 sobelPositions;
    mat3 sobelNormals;
    for (int x = 0; x < 3; x++) {
        for (int y = 0; y < 3; y++) {
            vec2 uvNeighbour = uv + vec2(x, y) * stepDist - stepDist;
            // I dont understand why position buffer works so well here.
            // Discovered by accident. should have been normal buffer.
            sobelPositions[x][y] = dot(normal, texture(tPosition, uvNeighbour).xyz);
            sobelNormals[x][y] = dot(normal, texture(tNormal, uvNeighbour).xyz);
        }
    }
    float positionG = sobel(sobelPositions);
    if (positionG < 1.0) positionG = 0.0;
    else positionG = 1.0;

    float normalG = sobel(sobelNormals);
    if (normalG < 1.0) normalG = 0.0;
    else normalG = 1.0;

    return max(positionG, normalG);
}

)"