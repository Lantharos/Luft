const FULL = /* wgsl */ `
@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
	let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
	return vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const ADJUSTMENT_LAYER = /* wgsl */ `
${FULL}
struct Params {
	a: vec4f,
	b: vec4f,
	mode: u32,
	opacity: f32,
	pad0: f32,
	pad1: f32,
}
@group(0) @binding(0) var backdrop: texture_2d<f32>;
@group(0) @binding(1) var lut: texture_2d<f32>;
@group(0) @binding(2) var layer_mask: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: Params;

fn lookup(value: f32, channel: u32) -> f32 {
	let index = i32(clamp(value, 0.0, 1.0) * 255.0 + 0.5);
	return textureLoad(lut, vec2i(index, 0), 0)[channel];
}

fn hueRotate(rgb: vec3f, degrees: f32) -> vec3f {
	let angle = radians(degrees);
	let k = vec3f(0.57735);
	let c = cos(angle);
	return rgb * c + cross(k, rgb) * sin(angle) + k * dot(k, rgb) * (1.0 - c);
}

fn adjusted(rgb: vec3f) -> vec3f {
	let luma = dot(rgb, vec3f(0.2126, 0.7152, 0.0722));
	switch params.mode {
		case 1u: {
			var shifted = hueRotate(rgb, params.a.x);
			let gray = dot(shifted, vec3f(0.2126, 0.7152, 0.0722));
			shifted = mix(vec3f(gray), shifted, 1.0 + params.a.y);
			let light = params.a.z;
			return select(shifted * (1.0 + light), shifted + (vec3f(1.0) - shifted) * light, light > 0.0);
		}
		case 2u: {
			let gray = clamp(dot(rgb, params.a.xyz), 0.0, 1.0);
			return mix(vec3f(gray), vec3f(gray) * params.b.xyz, params.b.w);
		}
		case 3u: {
			let high = max(rgb.r, max(rgb.g, rgb.b));
			let low = min(rgb.r, min(rgb.g, rgb.b));
			let amount = params.a.x * (1.0 - (high - low));
			let vibrant = mix(vec3f(luma), rgb, 1.0 + amount);
			return mix(vec3f(dot(vibrant, vec3f(0.2126, 0.7152, 0.0722))), vibrant, 1.0 + params.a.y);
		}
		default: {
			return vec3f(lookup(rgb.r, 0u), lookup(rgb.g, 1u), lookup(rgb.b, 2u));
		}
	}
}

@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let at = vec2i(position.xy);
	let below = textureLoad(backdrop, at, 0);
	if (below.a <= 0.0) {
		return below;
	}
	let rgb = below.rgb / below.a;
	let amount = params.opacity * textureLoad(layer_mask, at, 0).r;
	let result = mix(rgb, clamp(adjusted(rgb), vec3f(0.0), vec3f(1.0)), amount);
	return vec4f(result * below.a, below.a);
}
`;
