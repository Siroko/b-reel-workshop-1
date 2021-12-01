#version 300 es
precision highp float;

in vec2 vUv;
in vec4 vPosition;
out vec4 outColor;

void main() {
  
  vec4 c1 = vec4(1.0, 0.5, 0.0, 1.0);
  vec4 c2 = vec4(0.0, 1.0, 1.0, 1.0);
  vec4 c3 = vec4(0.0, 0.5, 1.0, 1.0);
  vec4 c4 = vec4(0.5, 1.0, 0.5, 1.0);

  vec4 fColor = mix(c1, c2, step(0.25, vPosition.a));
  fColor = mix(fColor, c3, step(0.5, vPosition.a));
  fColor = mix(fColor, c4, step(0.75, vPosition.a));

  outColor = fColor;
}