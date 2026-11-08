export const HIGHLIGHTER_OPACITY = 0.38;

const toLinear = (channel: number) => {
	const value = channel / 255;
	return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const toSrgb = (value: number) => {
	const clamped = Math.max(0, Math.min(1, value));
	const encoded = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055;
	return Math.round(encoded * 255);
};

function toOklab(rgb: number): [number, number, number] {
	const r = toLinear((rgb >> 16) & 255);
	const g = toLinear((rgb >> 8) & 255);
	const b = toLinear(rgb & 255);
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	return [
		0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
	];
}

function fromOklab([lightness, a, b]: [number, number, number]): number {
	const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const r = toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
	const g = toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
	const blue = toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
	return (r << 16) | (g << 8) | blue;
}

const forDark = new Map<number, number>();

/** The same ink on dark paper: lightness flipped, hue and colorfulness kept. */
export function onDark(rgb: number): number {
	let adapted = forDark.get(rgb);
	if (adapted === undefined) {
		const [lightness, a, b] = toOklab(rgb);
		adapted = fromOklab([0.25 + 0.72 * (1 - lightness), a, b]);
		forDark.set(rgb, adapted);
	}
	return adapted;
}

export const css = (rgb: number) => `#${rgb.toString(16).padStart(6, '0')}`;

/** A check mark or label color that stays readable on top of `rgb`. */
export const readableOn = (rgb: number) => (toOklab(rgb)[0] > 0.72 ? '#1d1d1f' : '#ffffff');
