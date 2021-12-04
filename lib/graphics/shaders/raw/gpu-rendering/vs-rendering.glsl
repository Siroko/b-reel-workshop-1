#version 300 es

in vec4 position;
in vec2 i2uv;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform sampler2D uPositionsTexture;
uniform vec3 cameraPosition;

out vec4 vPosition;

mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
  vec3 rr = vec3(sin(roll), cos(roll), 0.0);
  vec3 ww = normalize(target - origin);
  vec3 uu = normalize(cross(ww, rr));
  vec3 vv = normalize(cross(uu, ww));

  return mat3(uu, vv, ww);
}

float getTypeFactor(float v) {
  float typeFactor = mix(0.0, 0.25, step(0.05, v));
  typeFactor = mix(typeFactor, 5.5, step(0.5, v));
  typeFactor = mix(typeFactor, 7.75, step(0.75, v));
  typeFactor = mix(typeFactor, 6.0, step(1.0, v));

  return typeFactor;
}

void main() {

  vec4 pos = texture(uPositionsTexture, i2uv);
  pos.xyz += position.xyz * (1.0 + getTypeFactor(pos.w));
  vPosition = pos;
  vec4 projectedVert = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);

  gl_Position = projectedVert;
}