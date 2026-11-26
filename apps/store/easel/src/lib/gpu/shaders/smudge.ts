export const SMUDGE_DAB = /* wgsl */ `
struct Params {
	center: vec2f,
	radius: f32,
	strength: f32,
	size: vec2f,
	hardness: f32,
	pad: f32,
}
@group(0) @binding(0) var carried: texture_2d<f32>;
@group(0) @binding(1) var carried_sampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

struct Out {
	@builtin(position) position: vec4f,
	@location(0) local: vec2f,
}

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> Out {
	let corner = vec2f(f32(index & 1u), f32((index >> 1u) & 1u));
	let point = params.center + (corner * 2.0 - 1.0) * params.radius;
	var out: Out;
	out.position = vec4f(point.x / params.size.x * 2.0 - 1.0, 1.0 - point.y / params.size.y * 2.0, 0.0, 1.0);
	out.local = corner;
	return out;
}

@fragment
fn fragmentMain(input: Out) -> @location(0) vec4f {
	let distance = length(input.local * 2.0 - 1.0);
	let falloff = 1.0 - smoothstep(params.hardness, 1.0, distance);
	return textureSampleLevel(carried, carried_sampler, input.local, 0.0) * falloff * params.strength;
}
`;
