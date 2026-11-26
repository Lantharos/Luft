export const DAB = /* wgsl */ `
struct Params {
	origin: vec2f,
	size: vec2f,
}
@group(0) @binding(0) var<uniform> params: Params;

struct Out {
	@builtin(position) position: vec4f,
	@location(0) local: vec2f,
	@location(1) @interpolate(flat, either) shape: vec3f,
}

@vertex
fn vertexMain(@builtin(vertex_index) index: u32, @location(0) dab: vec4f, @location(1) hardness: f32) -> Out {
	let corner = vec2f(f32(index & 1u), f32((index >> 1u) & 1u)) * 2.0 - 1.0;
	let reach = dab.z + 1.0;
	let point = dab.xy + corner * reach;
	let local = (point - params.origin) / params.size;
	var out: Out;
	out.position = vec4f(local.x * 2.0 - 1.0, 1.0 - local.y * 2.0, 0.0, 1.0);
	out.local = corner * reach;
	out.shape = vec3f(dab.z, dab.w, hardness);
	return out;
}

@fragment
fn fragmentMain(input: Out) -> @location(0) vec4f {
	let radius = input.shape.x;
	let distance = length(input.local);
	let edge = clamp(radius + 0.5 - distance, 0.0, 1.0);
	let inner = radius * input.shape.z;
	let soft = 1.0 - smoothstep(inner, radius, distance);
	let amount = select(soft, edge, input.shape.z >= 0.999) * min(edge * 4.0, 1.0);
	return vec4f(amount * input.shape.y, 0.0, 0.0, 1.0);
}
`;
