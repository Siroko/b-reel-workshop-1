#version 300 es

in vec4 position;
in vec2 uv;

out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = position;
}