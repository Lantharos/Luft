export type Rgba = [number, number, number, number];

export function parseColor(hex: string): Rgba {
	const value = hex.replace('#', '');
	const full = value.length === 3 ? [...value].map((digit) => digit + digit).join('') : value;
	const number = parseInt(full.slice(0, 6), 16);
	const alpha = full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1;
	return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255, alpha];
}

export function premultiplied(hex: string): Rgba {
	const [r, g, b, a] = parseColor(hex);
	return [r * a, g * a, b * a, a];
}

export function toHex(r: number, g: number, b: number) {
	return `#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
}
