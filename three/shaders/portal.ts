/*
 * A closed loop whose radius wanders with a few slow harmonics. Its edge is a thin
 * white line inside a soft blue glow, lit from one side, so it reads as a light ring
 * breathing in the dark. The light's direction drifts on its own and leans a little
 * toward the pointer when there is one.
 */
export const PORTAL_FRAGMENT = `
precision mediump float;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerMix;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  float scale = min(uRes.x, uRes.y);
  vec2 p = (gl_FragCoord.xy - uRes * uCenter) / scale;
  float a = atan(p.y, p.x);
  float r = length(p);
  float t = uTime * 0.22;

  float R = 0.36
    + 0.055 * sin(2.0 * a + t * 1.30)
    + 0.040 * sin(3.0 * a - t * 0.90 + 1.7)
    + 0.028 * sin(5.0 * a + t * 1.70 + 0.4)
    + 0.016 * sin(7.0 * a - t * 2.10 + 2.3);
  float d = r - R;

  float line = exp(-abs(d) * 34.0);
  float outer = exp(-max(d, 0.0) * 5.5) * smoothstep(-0.015, 0.0, d);
  float inner = exp(-max(-d, 0.0) * 12.0) * (1.0 - smoothstep(-0.0, 0.015, d));

  vec2 drift = normalize(vec2(-0.85 + 0.25 * sin(t * 0.7), -0.35 + 0.35 * cos(t * 0.5)));
  vec2 lightDir = normalize(mix(drift, uPointer, uPointerMix));
  float lit = pow(0.5 + 0.5 * dot(normalize(p + 1e-5), lightDir), 1.6);
  float glow = 0.18 + 0.82 * lit;

  vec3 white = vec3(0.88, 0.91, 0.97);
  vec3 blue = vec3(0.24, 0.37, 0.72);
  vec3 col = white * line * lit * 0.95 + blue * (outer * 0.55 + inner * 0.35 + line * 0.35) * glow;

  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0 * 2.0;
  gl_FragColor = vec4(col, 1.0);
}
`;
