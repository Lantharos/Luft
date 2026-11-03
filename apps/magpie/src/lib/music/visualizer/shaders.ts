import type { VisualizerStyle } from './settings.svelte';

export const VERTEX = `#version 300 es
const vec2 CORNERS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
	gl_Position = vec4(CORNERS[gl_VertexID], 0.0, 1.0);
}`;

const COMMON = `#version 300 es
precision highp float;
uniform vec2 u_size;
uniform float u_time;
uniform vec2 u_center;
uniform vec2 u_cover;
uniform vec3 u_colors[4];
uniform vec3 u_energy;
uniform float u_strength;
uniform float u_scale;
uniform sampler2D u_bands;
out vec4 color;

const float PI = 3.14159265;

float band(float position) {
	return texture(u_bands, vec2(mix(0.5, 63.5, clamp(position, 0.0, 1.0)) / 64.0, 0.5)).r;
}

vec2 pixel() {
	return vec2(gl_FragCoord.x, u_size.y - gl_FragCoord.y);
}

float grain() {
	return (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
}

vec4 over(vec4 top, vec3 tint, float alpha) {
	return top + vec4(tint * alpha, alpha) * (1.0 - top.a);
}

void finish(vec4 painted) {
	float alpha = clamp(painted.a * u_strength, 0.0, 1.0);
	float noise = grain() * step(0.002, alpha);
	color = clamp(vec4(painted.rgb * u_strength + noise, alpha + noise), 0.0, 1.0);
}
`;

const SPECTRUM = `${COMMON}
void main() {
	vec2 p = pixel();
	float across = abs(p.x / u_size.x * 2.0 - 1.0);
	float height = (u_size.y - p.y) / u_size.y;
	float front = band(pow(across, 1.6) * 0.94);
	float back = band(pow(across, 1.4) * 0.8 + 0.1);
	float frontTop = 0.035 + pow(front, 1.35) * 0.42;
	float backTop = 0.06 + pow(back, 1.15) * 0.52 + 0.015 * sin(across * 9.0 + u_time * 0.8);
	float frontEdge = 0.012 + 0.03 * (1.0 - front);
	float frontAlpha = smoothstep(frontTop + frontEdge, frontTop - frontEdge, height) * mix(0.92, 0.4, clamp(height / frontTop, 0.0, 1.0));
	float backAlpha = smoothstep(backTop + 0.09, backTop - 0.05, height) * mix(0.55, 0.16, clamp(height / backTop, 0.0, 1.0));
	vec3 frontTint = mix(u_colors[0], u_colors[1], smoothstep(0.0, 1.0, across));
	vec3 backTint = mix(u_colors[2], u_colors[3], smoothstep(0.0, 1.0, across));
	float floorGlow = exp(-height * 7.0) * (0.12 + 0.35 * u_energy.x);
	vec4 painted = over(vec4(0.0), frontTint, frontAlpha);
	painted = over(painted, backTint, backAlpha);
	finish(over(painted, u_colors[0], floorGlow));
}`;

const RING = `${COMMON}
float roundedBox(vec2 p, float extent, float radius) {
	vec2 q = abs(p) - vec2(extent - radius);
	return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

void main() {
	vec2 p = pixel() - u_center;
	float outside = roundedBox(p, u_cover.x, u_cover.y);
	if (outside < 0.0) {
		finish(vec4(0.0));
		return;
	}
	float around = abs(atan(p.x, -p.y)) / PI;
	float level = band(around * 0.9) + 0.025 * sin(around * 14.0 + u_time * 1.4);
	float reach = u_cover.x * 0.3 * (1.0 - 0.7 * smoothstep(0.6, 1.0, around));
	vec4 painted = vec4(0.0);
	for (int ring = 0; ring < 3; ring++) {
		float layer = float(ring);
		float offset = (9.0 + layer * 7.0) * u_scale + level * reach * (1.0 - layer * 0.22);
		float width = (1.2 + layer * 1.4) * u_scale;
		float line = exp(-abs(outside - offset) / width);
		float glow = exp(-abs(outside - offset) / (width * 9.0)) * 0.22;
		painted = over(painted, mix(u_colors[ring], u_colors[3], around), (line * 0.85 + glow) * (1.0 - layer * 0.25));
	}
	float aura = exp(-outside / (u_cover.x * 0.55)) * (0.1 + 0.3 * u_energy.x);
	finish(over(painted, u_colors[0], aura));
}`;

const FIELDS = `${COMMON}
void main() {
	vec2 uv = pixel() / u_size.y;
	float aspect = u_size.x / u_size.y;
	float t = u_time;
	vec2 warped = uv + 0.07 * vec2(sin(uv.y * 2.6 + t * 0.5), cos(uv.x * 2.2 - t * 0.43));
	vec3 tint = vec3(0.0);
	float total = 0.0;
	for (int field = 0; field < 4; field++) {
		float index = float(field);
		vec2 center = vec2(
			aspect * (0.5 + 0.4 * sin(t * (0.07 + 0.017 * index) + index * 1.9)),
			0.5 + 0.38 * cos(t * (0.083 + 0.013 * index) + index * 2.7)
		);
		float size = 0.3 + 0.05 * index + 0.14 * u_energy[field % 3];
		vec2 offset = warped - center;
		float weight = exp(-dot(offset, offset) / (size * size));
		tint += u_colors[field] * weight;
		total += weight;
	}
	tint /= max(total, 0.0001);
	float alpha = mix(0.32, 0.8, clamp(total, 0.0, 1.0)) * (0.85 + 0.15 * u_energy.x);
	finish(vec4(tint * alpha, alpha));
}`;

export const FRAGMENTS: Record<VisualizerStyle, string> = { spectrum: SPECTRUM, ring: RING, fields: FIELDS };
