export const BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'add'] as const;

export type BlendMode = (typeof BLEND_MODES)[number];

export const BLEND_WGSL = /* wgsl */ `
fn overlayChannel(s: f32, d: f32) -> f32 {
	return select(1.0 - 2.0 * (1.0 - s) * (1.0 - d), 2.0 * s * d, d <= 0.5);
}

fn softLightChannel(s: f32, d: f32) -> f32 {
	if (s <= 0.5) {
		return d - (1.0 - 2.0 * s) * d * (1.0 - d);
	}
	let g = select(sqrt(d), ((16.0 * d - 12.0) * d + 4.0) * d, d <= 0.25);
	return d + (2.0 * s - 1.0) * (g - d);
}

fn dodgeChannel(s: f32, d: f32) -> f32 {
	if (d <= 0.0) { return 0.0; }
	if (s >= 1.0) { return 1.0; }
	return min(1.0, d / (1.0 - s));
}

fn burnChannel(s: f32, d: f32) -> f32 {
	if (d >= 1.0) { return 1.0; }
	if (s <= 0.0) { return 0.0; }
	return 1.0 - min(1.0, (1.0 - d) / s);
}

fn mixed(mode: u32, s: vec3f, d: vec3f) -> vec3f {
	switch mode {
		case 1u: { return s * d; }
		case 2u: { return s + d - s * d; }
		case 3u: { return vec3f(overlayChannel(s.r, d.r), overlayChannel(s.g, d.g), overlayChannel(s.b, d.b)); }
		case 4u: { return min(s, d); }
		case 5u: { return max(s, d); }
		case 6u: { return vec3f(dodgeChannel(s.r, d.r), dodgeChannel(s.g, d.g), dodgeChannel(s.b, d.b)); }
		case 7u: { return vec3f(burnChannel(s.r, d.r), burnChannel(s.g, d.g), burnChannel(s.b, d.b)); }
		case 8u: { return vec3f(overlayChannel(d.r, s.r), overlayChannel(d.g, s.g), overlayChannel(d.b, s.b)); }
		case 9u: { return vec3f(softLightChannel(s.r, d.r), softLightChannel(s.g, d.g), softLightChannel(s.b, d.b)); }
		case 10u: { return abs(s - d); }
		case 11u: { return min(vec3f(1.0), s + d); }
		default: { return s; }
	}
}

fn blendOver(mode: u32, source: vec4f, backdrop: vec4f) -> vec4f {
	let sa = source.a;
	let da = backdrop.a;
	if (mode == 0u || sa <= 0.0 || da <= 0.0) {
		return source + backdrop * (1.0 - sa);
	}
	let s = source.rgb / sa;
	let d = backdrop.rgb / da;
	let rgb = (1.0 - sa) * backdrop.rgb + (1.0 - da) * source.rgb + sa * da * mixed(mode, s, d);
	return vec4f(rgb, sa + da - sa * da);
}
`;
