import { fileSource } from '#lib/bridge/index.js';

export const PALETTE_SIZE = 4;

type Rgb = [number, number, number];
type Hsl = [number, number, number];

const SAMPLE = 32;
const CLUSTERS = 6;
const ROUNDS = 6;
const LIGHTNESS = [0.32, 0.68] as const;
const ACCENT_SHIFTS: Hsl[] = [
	[0, 1, 1],
	[28, 0.9, 0.82],
	[-24, 1.05, 1.12],
	[52, 0.75, 0.95]
];

const cache = new Map<string, Promise<Float32Array>>();

export function coverPalette(art: string) {
	let palette = cache.get(art);
	if (!palette) {
		palette = sample(fileSource(art)).then((pixels) => flatten(dominant(pixels)));
		cache.set(art, palette);
	}
	return palette;
}

export function accentPalette() {
	const [hue, saturation, lightness] = toHsl(parseColor(getComputedStyle(document.documentElement).getPropertyValue('--accent')));
	return flatten(ACCENT_SHIFTS.map(([turn, saturate, lighten]) => fromHsl([hue + turn, saturation * saturate, lightness * lighten])));
}

async function sample(url: string) {
	const image = new Image();
	image.crossOrigin = 'anonymous';
	image.src = url;
	await image.decode();
	const context = new OffscreenCanvas(SAMPLE, SAMPLE).getContext('2d', { willReadFrequently: true })!;
	context.drawImage(image, 0, 0, SAMPLE, SAMPLE);
	const { data } = context.getImageData(0, 0, SAMPLE, SAMPLE);
	const pixels: Rgb[] = [];
	for (let offset = 0; offset < data.length; offset += 4) pixels.push([data[offset] / 255, data[offset + 1] / 255, data[offset + 2] / 255]);
	return pixels;
}

function dominant(pixels: Rgb[]) {
	const byLight = pixels.toSorted((a, b) => luma(a) - luma(b));
	const centers = Array.from({ length: CLUSTERS }, (_, index) => byLight[Math.floor(((index + 0.5) * byLight.length) / CLUSTERS)]);
	let counts = new Array<number>(CLUSTERS).fill(0);
	for (let round = 0; round < ROUNDS; round++) {
		const sums = centers.map((): Rgb => [0, 0, 0]);
		counts = counts.fill(0);
		for (const pixel of pixels) {
			const nearest = closest(centers, pixel);
			counts[nearest]++;
			sums[nearest].forEach((_, channel) => (sums[nearest][channel] += pixel[channel]));
		}
		sums.forEach((sum, index) => counts[index] && (centers[index] = sum.map((value) => value / counts[index]) as Rgb));
	}
	const ranked = centers
		.map((center, index) => ({ hsl: toHsl(center), weight: counts[index] }))
		.filter(({ weight }) => weight > 0)
		.sort((a, b) => vividness(b) - vividness(a));
	const chosen = Array.from({ length: PALETTE_SIZE }, (_, index) => ranked[index % ranked.length].hsl);
	return chosen.map(([hue, saturation, lightness]) => fromHsl([hue, Math.min(1, saturation * 1.15), clamp(lightness, ...LIGHTNESS)]));
}

function vividness({ hsl: [, saturation, lightness], weight }: { hsl: Hsl; weight: number }) {
	return weight * (0.05 + saturation * saturation) * (1 - Math.abs(lightness - 0.5));
}

function closest(centers: Rgb[], pixel: Rgb) {
	let best = 0;
	let bestDistance = Infinity;
	centers.forEach((center, index) => {
		const distance = (center[0] - pixel[0]) ** 2 + (center[1] - pixel[1]) ** 2 + (center[2] - pixel[2]) ** 2;
		if (distance < bestDistance) [best, bestDistance] = [index, distance];
	});
	return best;
}

function parseColor(css: string): Rgb {
	const context = new OffscreenCanvas(1, 1).getContext('2d', { willReadFrequently: true })!;
	context.fillStyle = css;
	context.fillRect(0, 0, 1, 1);
	const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
	return [red / 255, green / 255, blue / 255];
}

function flatten(colors: Rgb[]) {
	return Float32Array.from(colors.flat());
}

function luma([red, green, blue]: Rgb) {
	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function clamp(value: number, low: number, high: number) {
	return Math.min(high, Math.max(low, value));
}

function toHsl([red, green, blue]: Rgb): Hsl {
	const high = Math.max(red, green, blue);
	const low = Math.min(red, green, blue);
	const lightness = (high + low) / 2;
	const chroma = high - low;
	if (chroma === 0) return [0, 0, lightness];
	const saturation = chroma / (1 - Math.abs(2 * lightness - 1));
	const sector = high === red ? ((green - blue) / chroma + 6) % 6 : high === green ? (blue - red) / chroma + 2 : (red - green) / chroma + 4;
	return [sector * 60, saturation, lightness];
}

function fromHsl([hue, saturation, lightness]: Hsl): Rgb {
	const chroma = (1 - Math.abs(2 * clamp(lightness, 0, 1) - 1)) * clamp(saturation, 0, 1);
	const turn = (((hue % 360) + 360) % 360) / 60;
	const second = chroma * (1 - Math.abs((turn % 2) - 1));
	const base = clamp(lightness, 0, 1) - chroma / 2;
	const sectors: Rgb[] = [
		[chroma, second, 0],
		[second, chroma, 0],
		[0, chroma, second],
		[0, second, chroma],
		[second, 0, chroma],
		[chroma, 0, second]
	];
	return sectors[Math.floor(turn) % 6].map((channel) => channel + base) as Rgb;
}
