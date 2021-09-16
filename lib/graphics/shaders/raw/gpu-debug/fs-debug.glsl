#version 300 es
precision highp float;

uniform sampler2D uTexture;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec4 textureColor = texture(uTexture, vUv);
  outColor = textureColor;
}