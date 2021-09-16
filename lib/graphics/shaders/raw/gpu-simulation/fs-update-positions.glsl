#version 300 es
precision highp float;

uniform sampler2D uPositionsTexture;
uniform float uTime;

in vec2 vUv;
out vec4 outColor;

void main() {

  vec4 positions = texture(uPositionsTexture, vUv);
  positions.y += (sin(uTime) * 0.01) * cos(positions.x * 0.1) * 100.0;

  outColor = positions;
}