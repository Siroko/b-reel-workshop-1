#version 300 es
precision highp float;

uniform sampler2D uPositionsTexture;
uniform sampler2D uVelocitiesTexture;
uniform float uTime;
uniform float uDeltaTime;

in vec2 vUv;
out vec4 outColor;

void main() {

  vec4 positions = texture(uPositionsTexture, vUv);
  vec4 velocity = texture(uVelocitiesTexture, vUv);

  positions.xyz += velocity.xyz * uDeltaTime;

  outColor = vec4(positions.xyz, velocity.w);
}