const FULL = /* wgsl */ `
@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
	let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
	return vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
}
`;

const PARAMS = /* wgsl */ `
struct Params {
	a: vec4f,
	b: vec4f,
	c: vec4f,
}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var smooth_sampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@group(0) @binding(3) var other: texture_2d<f32>;

fn sizeOf() -> vec2f {
	return vec2f(textureDimensions(source));
}

fn touch() {
	_ = textureDimensions(other);
	_ = params.c;
}

fn at(point: vec2f) -> vec4f {
	return textureSampleLevel(source, smooth_sampler, point / sizeOf(), 0.0);
}
`;

export const BLUR = /* wgsl */ `
${FULL}
${PARAMS}
@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	touch();
	let direction = params.a.xy;
	let radius = params.a.z;
	let sigma = max(radius / 2.0, 0.5);
	var total = vec4f(0.0);
	var weights = 0.0;
	let steps = i32(ceil(radius));
	for (var step = -steps; step <= steps; step++) {
		let offset = f32(step);
		let weight = exp(-(offset * offset) / (2.0 * sigma * sigma));
		total += at(position.xy + direction * offset) * weight;
		weights += weight;
	}
	return total / weights;
}
`;

export const MOTION = /* wgsl */ `
${FULL}
${PARAMS}
@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	touch();
	let direction = params.a.xy;
	let distance = params.a.z;
	let taps = 48;
	var total = vec4f(0.0);
	for (var step = 0; step < taps; step++) {
		let share = f32(step) / f32(taps - 1) - 0.5;
		total += at(position.xy + direction * distance * share);
	}
	return total / f32(taps);
}
`;

export const RESAMPLE = /* wgsl */ `
${FULL}
${PARAMS}
@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	touch();
	return at(position.xy * params.a.xy + params.a.zw);
}
`;

export const UNSHARP = /* wgsl */ `
${FULL}
${PARAMS}
@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	touch();
	let original = textureLoad(source, vec2i(position.xy), 0);
	let blurred = textureSampleLevel(other, smooth_sampler, position.xy / sizeOf(), 0.0);
	let detail = original.rgb - blurred.rgb;
	let strong = select(vec3f(0.0), detail, abs(detail) > vec3f(params.a.y));
	return vec4f(clamp(original.rgb + strong * params.a.x, vec3f(0.0), vec3f(original.a)), original.a);
}
`;

export const DENOISE = /* wgsl */ `
${FULL}
${PARAMS}
@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	touch();
	let center = textureLoad(source, vec2i(position.xy), 0);
	let spread = params.a.x;
	let radius = 3;
	var total = vec4f(0.0);
	var weights = 0.0;
	for (var y = -radius; y <= radius; y++) {
		for (var x = -radius; x <= radius; x++) {
			let sample = textureLoad(source, clamp(vec2i(position.xy) + vec2i(x, y), vec2i(0), vec2i(sizeOf()) - 1), 0);
			let difference = distance(sample.rgb, center.rgb);
			let weight = exp(-f32(x * x + y * y) / 8.0) * exp(-(difference * difference) / max(spread * spread, 1e-5));
			total += sample * weight;
			weights += weight;
		}
	}
	return total / weights;
}
`;

export const VIGNETTE = /* wgsl */ `
${FULL}
${PARAMS}
@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	touch();
	let color = textureLoad(source, vec2i(position.xy), 0);
	let size = sizeOf();
	let offset = (position.xy - size / 2.0) / (size / 2.0);
	let reach = length(offset) / sqrt(2.0);
	let fade = smoothstep(params.a.y, 1.0, reach) * params.a.x;
	return vec4f(color.rgb * (1.0 - fade), color.a);
}
`;

export const PIXELATE = /* wgsl */ `
${FULL}
${PARAMS}
@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	touch();
	let block = params.a.x;
	let center = (floor(position.xy / block) + 0.5) * block;
	return textureSampleLevel(other, smooth_sampler, center / sizeOf(), 0.0);
}
`;

export const SHADOW = /* wgsl */ `
${FULL}
${PARAMS}
@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	touch();
	let alpha = at(position.xy - params.b.xy).a;
	return vec4f(params.a.rgb, 1.0) * alpha * params.a.a;
}
`;

export const OUTLINE = /* wgsl */ `
${FULL}
${PARAMS}
@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	touch();
	let spread = at(position.xy).a;
	let alpha = smoothstep(0.02, 0.12, spread);
	return vec4f(params.a.rgb, 1.0) * alpha * params.a.a;
}
`;

export const MIX = /* wgsl */ `
${FULL}
${PARAMS}
@group(0) @binding(4) var amount: texture_2d<f32>;
@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	touch();
	let at_tile = vec2i(position.xy);
	let share = textureLoad(amount, at_tile, 0).r;
	let filtered = textureSampleLevel(other, smooth_sampler, (position.xy + params.a.xy) / vec2f(textureDimensions(other)), 0.0);
	return mix(textureLoad(source, at_tile, 0), filtered, share);
}
`;

export const THRESHOLD = /* wgsl */ `
${FULL}
${PARAMS}
@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	touch();
	let grown = at(params.b.xy + position.xy).r;
	let shrunk = textureSampleLevel(other, smooth_sampler, (params.b.xy + position.xy) / vec2f(textureDimensions(other)), 0.0).r;
	let outer = smoothstep(params.a.x, params.a.y, grown);
	let inner = smoothstep(params.a.z, params.a.w, shrunk);
	let value = select(outer, outer * (1.0 - inner), params.b.z > 0.5);
	return vec4f(value, 0.0, 0.0, 1.0);
}
`;
