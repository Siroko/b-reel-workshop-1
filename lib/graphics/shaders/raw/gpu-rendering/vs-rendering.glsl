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

mat4 rotation3d(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(
		oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
		0.0,                                0.0,                                0.0,                                1.0
	);
}

mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
  vec3 rr = vec3(sin(roll), cos(roll), 0.0);
  vec3 ww = normalize(target - origin);
  vec3 uu = normalize(cross(ww, rr));
  vec3 vv = normalize(cross(uu, ww));

  return mat3(uu, vv, ww);
}

float getTypeFactor(float v) {
  float typeFactor = mix(0.0, 0.25, step(0.05, v));
  typeFactor = mix(typeFactor, 1.5, step(0.5, v));
  typeFactor = mix(typeFactor, 2.75, step(0.75, v));
  typeFactor = mix(typeFactor, 1.0, step(1.0, v));

  return typeFactor;
}

void main() {

  float rotationScale = 0.1;
  vec4 pos = texture(uPositionsTexture, i2uv);
  mat4 rX = rotation3d(vec3(1.0, 0.0, 0.0), pos.x * rotationScale);
  mat4 rY = rotation3d(vec3(0.0, 1.0, 0.0), pos.y * rotationScale);
  mat4 rZ = rotation3d(vec3(0.0, 0.0, 1.0), pos.z * rotationScale);
  mat4 composedRotation = rX * rY * rZ;
  vec4 scaledPosition = position * (1.0 + getTypeFactor(pos.w));
  vec4 rotatedGeometry = composedRotation * scaledPosition;
  pos.xyz += rotatedGeometry.xyz;
  
  vPosition = pos;
  vec4 projectedVert = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);

  gl_Position = projectedVert;
}