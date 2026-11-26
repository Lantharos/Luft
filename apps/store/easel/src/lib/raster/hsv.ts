import { parseColor, toHex } from './color';

export interface Hsv {
	h: number;
	s: number;
	v: number;
}

export function toHsv(hex: string): Hsv {
	const [r, g, b] = parseColor(hex);
	const max = Math.max(r, g, b);
	const delta = max - Math.min(r, g, b);
	let h = 0;
	if (delta) {
		if (max === r) h = ((g - b) / delta) % 6;
		else if (max === g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;
	}
	return { h: ((h * 60) + 360) % 360, s: max ? delta / max : 0, v: max };
}

export function fromHsv({ h, s, v }: Hsv) {
	const channel = (n: number) => {
		const k = (n + h / 60) % 6;
		return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
	};
	return toHex(channel(5), channel(3), channel(1));
}
