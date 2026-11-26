import { ADJUST_WGSL } from './adjust';
import { BLEND_WGSL } from './blend';

const FULL = /* wgsl */ `
@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
	let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
	return vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const COMPOSITE = /* wgsl */ `
${FULL}
${BLEND_WGSL}
${ADJUST_WGSL}
struct Params {
	stroke_color: vec4f,
	opacity: f32,
	blend: u32,
	stroke_mode: u32,
	stroke_opacity: f32,
	adjust: Adjust,
	stroke_target: u32,
	clone_mode: u32,
	pad1: f32,
	pad2: f32,
	clone: vec4f,
}
@group(0) @binding(0) var backdrop: texture_2d<f32>;
@group(0) @binding(1) var layer: texture_2d<f32>;
@group(0) @binding(2) var stroke: texture_2d<f32>;
@group(0) @binding(3) var selection: texture_2d<f32>;
@group(0) @binding(4) var layer_mask: texture_2d<f32>;
@group(0) @binding(5) var<uniform> params: Params;
@group(0) @binding(6) var clone_source: texture_2d<f32>;
@group(0) @binding(7) var low_source: texture_2d<f32>;
@group(0) @binding(8) var low_sampler: sampler;

fn cloned(at: vec2i) -> vec4f {
	let point = vec2f(at) + params.clone.zw;
	let origin_point = point - params.clone.xy;
	let size = vec2f(textureDimensions(clone_source));
	let inside = all(origin_point >= vec2f(0.0)) && all(origin_point < size);
	var color = select(vec4f(0.0), textureLoad(clone_source, vec2i(origin_point), 0), inside);
	if (params.clone_mode == 2u) {
		let low = vec2f(textureDimensions(low_source));
		let here = textureSampleLevel(low_source, low_sampler, (point + 0.5) / size, 0.0);
		let there = textureSampleLevel(low_source, low_sampler, (origin_point + 0.5) / size, 0.0);
		color = vec4f(clamp(color.rgb + (here.rgb - there.rgb), vec3f(0.0), vec3f(color.a)), color.a);
		_ = low;
	}
	return color;
}

@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let at = vec2i(position.xy);
	var source = adjustPixel(layer, at, params.adjust);
	var cover = textureLoad(layer_mask, at, 0).r;
	if (params.stroke_mode != 0u) {
		let amount = textureLoad(stroke, at, 0).r * params.stroke_opacity * textureLoad(selection, at, 0).r;
		if (params.stroke_target == 1u) {
			cover = select(cover * (1.0 - amount), cover + (1.0 - cover) * amount, params.stroke_mode == 1u);
		} else if (params.clone_mode != 0u) {
			source = cloned(at) * amount + source * (1.0 - amount);
		} else if (params.stroke_mode == 1u) {
			source = params.stroke_color * amount + source * (1.0 - amount);
		} else {
			source = source * (1.0 - amount);
		}
	}
	source = source * (params.opacity * cover);
	return blendOver(params.blend, source, textureLoad(backdrop, at, 0));
}
`;

export const BAKE = /* wgsl */ `
${FULL}
struct Params {
	color: vec4f,
	opacity: f32,
	mode: u32,
	pad0: f32,
	pad1: f32,
}
@group(0) @binding(0) var layer: texture_2d<f32>;
@group(0) @binding(1) var amount_mask: texture_2d<f32>;
@group(0) @binding(2) var selection: texture_2d<f32>;
@group(0) @binding(3) var source: texture_2d<f32>;
@group(0) @binding(4) var<uniform> params: Params;

@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let at = vec2i(position.xy);
	let below = textureLoad(layer, at, 0);
	let amount = textureLoad(amount_mask, at, 0).r * params.opacity * textureLoad(selection, at, 0).r;
	switch params.mode {
		case 1u: { return below * (1.0 - amount); }
		case 2u: {
			let top = textureLoad(source, at, 0) * amount;
			return top + below * (1.0 - top.a);
		}
		case 3u: { return below * amount; }
		default: { return params.color * amount + below * (1.0 - amount); }
	}
}
`;

export const GRADIENT = /* wgsl */ `
${FULL}
struct Params {
	from_color: vec4f,
	to_color: vec4f,
	start: vec2f,
	end: vec2f,
	origin: vec2f,
	radial: u32,
	opacity: f32,
}
@group(0) @binding(0) var layer: texture_2d<f32>;
@group(0) @binding(1) var selection: texture_2d<f32>;
@group(0) @binding(2) var<uniform> params: Params;

@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let at = vec2i(position.xy);
	let point = params.origin + position.xy;
	let axis = params.end - params.start;
	let length2 = max(dot(axis, axis), 1e-6);
	var t = dot(point - params.start, axis) / length2;
	if (params.radial == 1u) {
		t = distance(point, params.start) / sqrt(length2);
	}
	let color = mix(params.from_color, params.to_color, clamp(t, 0.0, 1.0)) * (params.opacity * textureLoad(selection, at, 0).r);
	let below = textureLoad(layer, at, 0);
	return color + below * (1.0 - color.a);
}
`;

export const DOWNSAMPLE = /* wgsl */ `
${FULL}
@group(0) @binding(0) var source: texture_2d<f32>;

@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let at = vec2i(position.xy) * 2;
	return (textureLoad(source, at, 0) + textureLoad(source, at + vec2i(1, 0), 0) + textureLoad(source, at + vec2i(0, 1), 0) + textureLoad(source, at + vec2i(1, 1), 0)) * 0.25;
}
`;

export const TRANSFORM = /* wgsl */ `
struct Params {
	matrix: mat3x3f,
	target_origin: vec2f,
	source_origin: vec2f,
	source_size: vec2f,
	target_size: vec2f,
}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var smooth_sampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

struct Out {
	@builtin(position) position: vec4f,
	@location(0) uv: vec2f,
}

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> Out {
	let corner = vec2f(f32(index & 1u), f32((index >> 1u) & 1u));
	let documentPoint = params.matrix * vec3f(params.source_origin + corner * params.source_size, 1.0);
	let local = (documentPoint.xy - params.target_origin * documentPoint.z) / params.target_size;
	var out: Out;
	out.position = vec4f(local.x * 2.0 - documentPoint.z, documentPoint.z - local.y * 2.0, 0.0, documentPoint.z);
	out.uv = corner * params.source_size / vec2f(textureDimensions(source));
	return out;
}

@fragment
fn fragmentMain(input: Out) -> @location(0) vec4f {
	return textureSample(source, smooth_sampler, input.uv);
}
`;

export const ADJUST = /* wgsl */ `
${FULL}
${ADJUST_WGSL}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var<uniform> adjust: Adjust;

@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	return adjustPixel(source, vec2i(position.xy), adjust);
}
`;
