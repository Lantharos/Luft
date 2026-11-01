type Rgb = [number, number, number];

export interface Oklch {
	lightness: number;
	chroma: number;
	hue: number;
}

const GAMUT_STEPS = 12;

const encode = (linear: number) => (linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055);
const decode = (value: number) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);

function linear({ lightness, chroma, hue }: Oklch): Rgb {
	const angle = (hue * Math.PI) / 180;
	const greenRed = chroma * Math.cos(angle);
	const blueYellow = chroma * Math.sin(angle);
	const l = (lightness + 0.3963377774 * greenRed + 0.2158037573 * blueYellow) ** 3;
	const m = (lightness - 0.1055613458 * greenRed - 0.0638541728 * blueYellow) ** 3;
	const s = (lightness - 0.0894841775 * greenRed - 1.291485548 * blueYellow) ** 3;
	return [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
	];
}

const inGamut = (rgb: Rgb) => rgb.every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4);

/** The color at a lightness, chroma and hue, with the chroma lowered as far as the screen's colors need. */
export function rgbOf(color: Oklch): Rgb {
	let shown = linear(color);
	if (!inGamut(shown)) {
		let [low, high] = [0, color.chroma];
		for (let step = 0; step < GAMUT_STEPS; step++) {
			const middle = (low + high) / 2;
			if (inGamut(linear({ ...color, chroma: middle }))) low = middle;
			else high = middle;
		}
		shown = linear({ ...color, chroma: low });
	}
	return shown.map((channel) => Math.round(255 * encode(Math.min(1, Math.max(0, channel))))) as Rgb;
}

export const toHex = (rgb: Rgb) => `#${rgb.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;

export function oklchOf(hex: string): Oklch {
	const [r, g, b] = [1, 3, 5].map((offset) => decode(parseInt(hex.slice(offset, offset + 2), 16) / 255));
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	const greenRed = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const blueYellow = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
	return {
		lightness: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		chroma: Math.hypot(greenRed, blueYellow),
		hue: ((Math.atan2(blueYellow, greenRed) * 180) / Math.PI + 360) % 360
	};
}
