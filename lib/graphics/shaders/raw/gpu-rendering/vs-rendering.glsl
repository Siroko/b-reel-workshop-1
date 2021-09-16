#version 300 es

in vec4 position;
in vec2 i2uv;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform sampler2D uPositionsTexture;

void main() {

  vec4 pos = texture(uPositionsTexture, i2uv);
  vec4 projectedVert = projectionMatrix * viewMatrix * modelMatrix * vec4(pos.xyz, 1.0);

  gl_Position = projectedVert;
  gl_PointSize = 1.0;
}