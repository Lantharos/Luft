const VIEW = /* wgsl */ `
struct View {
	matrix: mat3x3f,
	viewport: vec2f,
	scale: f32,
	pad: f32,
}
@group(0) @binding(0) var<uniform> view: View;

fn toClip(point: vec2f) -> vec4f {
	let screen = view.matrix * vec3f(point, 1.0);
	return vec4f(screen.x / view.viewport.x * 2.0 - 1.0, 1.0 - screen.y / view.viewport.y * 2.0, 0.0, 1.0);
}
`;

export const SOLID = /* wgsl */ `
${VIEW}
struct Out {
	@builtin(position) position: vec4f,
	@location(0) color: vec4f,
}

@vertex
fn vertexMain(@location(0) point: vec2f, @location(1) color: vec4f) -> Out {
	var out: Out;
	out.position = toClip(point);
	out.color = vec4f(color.rgb * color.a, color.a);
	return out;
}

@fragment
fn fragmentMain(input: Out) -> @location(0) vec4f {
	return input.color;
}
`;

export const IMAGE = /* wgsl */ `
${VIEW}
struct Quad {
	rect: vec4f,
	tint: vec4f,
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
	out.position = toClip(quad.rect.xy + corner * quad.rect.zw);
	out.uv = corner;
	return out;
}

@fragment
fn fragmentMain(input: Out) -> @location(0) vec4f {
	return textureSample(image, image_sampler, input.uv) * quad.tint.a;
}
`;

export const GRID = /* wgsl */ `
${VIEW}
struct Grid {
	color: vec4f,
	spacing: f32,
	radius: f32,
	pad0: f32,
	pad1: f32,
}
@group(1) @binding(0) var<uniform> grid: Grid;

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
	let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
	return vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
}

@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let a = view.matrix[0][0];
	let origin = vec2f(view.matrix[2][0], view.matrix[2][1]);
	let board = (position.xy - origin) / a;
	let cell = board / grid.spacing;
	let offset = (cell - round(cell)) * grid.spacing * a;
	let distance = length(offset);
	let alpha = clamp(grid.radius + 0.5 - distance, 0.0, 1.0) * grid.color.a;
	return vec4f(grid.color.rgb * alpha, alpha);
}
`;
