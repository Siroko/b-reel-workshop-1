#version 300 es
precision highp float;

in vec2 vUv;
in vec4 vPosition;
out vec4 outColor;

vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {

  vec3 fColor = pal( vPosition.a, vec3(0.5,0.5,0.5), vec3(0.5,0.5,0.5), vec3(1.0,1.0,1.0), vec3(0.7,0.5,0.60) );

  outColor = vec4(fColor, 1.0);
}