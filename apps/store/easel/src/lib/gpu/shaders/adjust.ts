export interface Adjust {
	exposure: number;
	contrast: number;
	saturation: number;
	warmth: number;
	sharpen: number;
}

export const NEUTRAL: Adjust = { exposure: 0, contrast: 0, saturation: 0, warmth: 0, sharpen: 0 };

export const isNeutral = (adjust: Adjust) => Object.values(adjust).every((value) => value === 0);

export const adjustValues = (adjust: Adjust | null) => (adjust ? [adjust.exposure, adjust.contrast, adjust.saturation, adjust.warmth, adjust.sharpen] : [0, 0, 0, 0, 0]);

export const ADJUST_WGSL = /* wgsl */ `
struct Adjust {
	exposure: f32,
	contrast: f32,
	saturation: f32,
	warmth: f32,
	sharpen: f32,
	enabled: u32,
	pad0: f32,
	pad1: f32,
}

fn adjustPixel(source: texture_2d<f32>, at: vec2i, adjust: Adjust) -> vec4f {
	let color = textureLoad(source, at, 0);
	if (adjust.enabled == 0u || color.a <= 0.0) {
		return color;
	}
	let size = vec2i(textureDimensions(source)) - 1;
	var rgb = color.rgb / color.a;
	if (adjust.sharpen > 0.0) {
		let around = textureLoad(source, clamp(at + vec2i(1, 0), vec2i(0), size), 0) + textureLoad(source, clamp(at - vec2i(1, 0), vec2i(0), size), 0) + textureLoad(source, clamp(at + vec2i(0, 1), vec2i(0), size), 0) + textureLoad(source, clamp(at - vec2i(0, 1), vec2i(0), size), 0);
		let average = around.rgb / max(around.a, 1e-4);
		rgb = rgb + (rgb - average) * adjust.sharpen * 1.5;
	}
	rgb = rgb * exp2(adjust.exposure);
	rgb = (rgb - 0.5) * (1.0 + adjust.contrast) + 0.5;
	let luma = dot(rgb, vec3f(0.2126, 0.7152, 0.0722));
	rgb = mix(vec3f(luma), rgb, 1.0 + adjust.saturation);
	rgb = rgb + vec3f(adjust.warmth, adjust.warmth * 0.2, -adjust.warmth) * 0.12;
	return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)) * color.a, color.a);
}
`;
