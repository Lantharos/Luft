export const DEVELOP = /* wgsl */ `
@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
	let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
	return vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
}

struct Params {
	exposure: f32,
	temperature: f32,
	tint: f32,
	highlights: f32,
	shadows: f32,
}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var<uniform> params: Params;

const SHOULDER = 0.8;

fn encoded(value: f32) -> f32 {
	if (value <= 0.0031308) {
		return value * 12.92;
	}
	return 1.055 * pow(value, 1.0 / 2.4) - 0.055;
}

fn rolled(value: f32) -> f32 {
	if (value <= SHOULDER) {
		return value;
	}
	let over = (value - SHOULDER) / (1.0 - SHOULDER);
	return SHOULDER + (1.0 - SHOULDER) * over / (1.0 + over);
}

@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let balance = vec3f(exp2(params.temperature * 0.5), exp2(-params.tint * 0.4), exp2(-params.temperature * 0.5));
	let scene = max(textureLoad(source, vec2i(position.xy), 0).rgb * balance * exp2(params.exposure), vec3f(0.0));
	var tone = vec3f(encoded(scene.r), encoded(scene.g), encoded(scene.b));
	let light = dot(tone, vec3f(0.2126, 0.7152, 0.0722));
	let bright = smoothstep(0.45, 1.1, light);
	let dark = 1.0 - smoothstep(0.0, 0.5, light);
	let shifted = max(light + params.highlights * 0.3 * bright + params.shadows * 0.3 * dark, 0.0);
	tone = tone * (shifted / max(light, 1e-4));
	return vec4f(rolled(tone.r), rolled(tone.g), rolled(tone.b), 1.0);
}
`;
