const VIEW = /* wgsl */ `
struct View {
	matrix: mat3x3f,
	viewport: vec2f,
	time: f32,
	scale: f32,
}
@group(0) @binding(0) var<uniform> view: View;

fn toClipH(point: vec3f) -> vec4f {
	let screen = view.matrix * point;
	return vec4f(screen.x / view.viewport.x * 2.0 - screen.z, screen.z - screen.y / view.viewport.y * 2.0, 0.0, screen.z);
}

fn toClip(point: vec2f) -> vec4f {
	let screen = view.matrix * vec3f(point, 1.0);
	return vec4f(screen.x / view.viewport.x * 2.0 - 1.0, 1.0 - screen.y / view.viewport.y * 2.0, 0.0, 1.0);
}
`;

export const PRESENT = /* wgsl */ `
${VIEW}
struct Quad {
	model: mat3x3f,
	rect: vec4f,
	uv: vec4f,
}
@group(1) @binding(0) var<uniform> quad: Quad;
@group(1) @binding(1) var image: texture_2d<f32>;
@group(1) @binding(2) var image_sampler: sampler;

struct Out {
	@builtin(position) position: vec4f,
	@location(0) uv: vec2f,
}

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> Out {
	let corner = vec2f(f32(index & 1u), f32((index >> 1u) & 1u));
	var out: Out;
	out.position = toClipH(quad.model * vec3f(quad.rect.xy + corner * quad.rect.zw, 1.0));
	out.uv = quad.uv.xy + corner * quad.uv.zw;
	return out;
}

@fragment
fn fragmentMain(input: Out) -> @location(0) vec4f {
	return textureSample(image, image_sampler, input.uv);
}
`;

export const PRESENT_MASK = PRESENT.replace('return textureSample(image, image_sampler, input.uv);', 'let value = textureSample(image, image_sampler, input.uv).r;\n\treturn vec4f(value, value, value, 1.0);');

export const CHECKER = /* wgsl */ `
${VIEW}
struct Area {
	rect: vec4f,
	light: vec4f,
	dark: vec4f,
}
@group(1) @binding(0) var<uniform> area: Area;

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
	let corner = vec2f(f32(index & 1u), f32((index >> 1u) & 1u));
	return toClip(area.rect.xy + corner * area.rect.zw);
}

@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let cell = vec2i(floor(position.xy / 8.0));
	return select(area.dark, area.light, ((cell.x + cell.y) & 1) == 0);
}
`;

export const ANTS = /* wgsl */ `
${VIEW}
struct Quad {
	model: mat3x3f,
	rect: vec4f,
	uv: vec4f,
}
@group(1) @binding(0) var<uniform> quad: Quad;
@group(1) @binding(1) var mask: texture_2d<f32>;
@group(1) @binding(2) var mask_sampler: sampler;

struct Out {
	@builtin(position) position: vec4f,
	@location(0) uv: vec2f,
}

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> Out {
	let corner = vec2f(f32(index & 1u), f32((index >> 1u) & 1u));
	var out: Out;
	out.position = toClipH(quad.model * vec3f(quad.rect.xy + corner * quad.rect.zw, 1.0));
	out.uv = quad.uv.xy + corner * quad.uv.zw;
	return out;
}

fn inside(uv: vec2f) -> bool {
	return textureSampleLevel(mask, mask_sampler, uv, 0.0).r >= 0.5;
}

@fragment
fn fragmentMain(input: Out) -> @location(0) vec4f {
	if (!inside(input.uv)) {
		discard;
	}
	let step = 1.0 / (view.scale * f32(textureDimensions(mask).x));
	let edge = !inside(input.uv + vec2f(step, 0.0)) || !inside(input.uv - vec2f(step, 0.0)) || !inside(input.uv + vec2f(0.0, step)) || !inside(input.uv - vec2f(0.0, step));
	if (!edge) {
		discard;
	}
	let dash = fract((input.position.x + input.position.y - view.time * 24.0) / 12.0) < 0.5;
	return select(vec4f(0.0, 0.0, 0.0, 1.0), vec4f(1.0), dash);
}
`;

export const QUICK_MASK = /* wgsl */ `
${VIEW}
struct Quad {
	model: mat3x3f,
	rect: vec4f,
	uv: vec4f,
}
struct Stroke {
	mode: u32,
	opacity: f32,
	pad0: f32,
	pad1: f32,
}
@group(1) @binding(0) var<uniform> quad: Quad;
@group(1) @binding(1) var mask: texture_2d<f32>;
@group(1) @binding(2) var mask_sampler: sampler;
@group(1) @binding(3) var stroke: texture_2d<f32>;
@group(1) @binding(4) var<uniform> live: Stroke;

struct Out {
	@builtin(position) position: vec4f,
	@location(0) uv: vec2f,
}

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> Out {
	let corner = vec2f(f32(index & 1u), f32((index >> 1u) & 1u));
	var out: Out;
	out.position = toClipH(quad.model * vec3f(quad.rect.xy + corner * quad.rect.zw, 1.0));
	out.uv = quad.uv.xy + corner * quad.uv.zw;
	return out;
}

@fragment
fn fragmentMain(input: Out) -> @location(0) vec4f {
	var value = textureSample(mask, mask_sampler, input.uv).r;
	let amount = textureSample(stroke, mask_sampler, input.uv).r * live.opacity;
	if (live.mode == 1u) {
		value = value + (1.0 - value) * amount;
	} else if (live.mode == 2u) {
		value = value * (1.0 - amount);
	}
	let alpha = (1.0 - value) * 0.5;
	return vec4f(0.86, 0.18, 0.2, 1.0) * alpha;
}
`;
