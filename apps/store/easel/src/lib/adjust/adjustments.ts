export type AdjustmentType = 'curves' | 'levels' | 'hue' | 'balance' | 'mono' | 'brightness' | 'exposure' | 'vibrance';

export type CurvePoint = [number, number];

export interface Adjustment {
	type: AdjustmentType;
	curve: CurvePoint[];
	levels: { black: number; white: number; gamma: number; outBlack: number; outWhite: number };
	hue: { hue: number; saturation: number; lightness: number };
	balance: { shadows: [number, number, number]; midtones: [number, number, number]; highlights: [number, number, number] };
	mono: { red: number; green: number; blue: number; tint: string; tintAmount: number };
	brightness: { brightness: number; contrast: number };
	exposure: { exposure: number; offset: number; gamma: number };
	vibrance: { vibrance: number; saturation: number };
}

export const ADJUSTMENT_TYPES: AdjustmentType[] = ['curves', 'levels', 'hue', 'balance', 'mono', 'brightness', 'exposure', 'vibrance'];

export function newAdjustment(type: AdjustmentType): Adjustment {
	return {
		type,
		curve: [
			[0, 0],
			[1, 1]
		],
		levels: { black: 0, white: 1, gamma: 1, outBlack: 0, outWhite: 1 },
		hue: { hue: 0, saturation: 0, lightness: 0 },
		balance: { shadows: [0, 0, 0], midtones: [0, 0, 0], highlights: [0, 0, 0] },
		mono: { red: 0.4, green: 0.4, blue: 0.2, tint: '#d8b98a', tintAmount: 0 },
		brightness: { brightness: 0, contrast: 0 },
		exposure: { exposure: 0, offset: 0, gamma: 1 },
		vibrance: { vibrance: 0, saturation: 0 }
	};
}

export const SHADER_MODE: Record<AdjustmentType, number> = { curves: 0, levels: 0, balance: 0, brightness: 0, exposure: 0, hue: 1, mono: 2, vibrance: 3 };

function spline(points: CurvePoint[]) {
	const sorted = [...points].sort((a, b) => a[0] - b[0]);
	const n = sorted.length;
	const slopes = sorted.map((point, index) => {
		if (index === 0) return (sorted[1][1] - point[1]) / Math.max(1e-6, sorted[1][0] - point[0]);
		if (index === n - 1) return (point[1] - sorted[n - 2][1]) / Math.max(1e-6, point[0] - sorted[n - 2][0]);
		return (sorted[index + 1][1] - sorted[index - 1][1]) / Math.max(1e-6, sorted[index + 1][0] - sorted[index - 1][0]);
	});
	return (x: number) => {
		if (x <= sorted[0][0]) return sorted[0][1];
		if (x >= sorted[n - 1][0]) return sorted[n - 1][1];
		const index = sorted.findIndex((_, at) => at < n - 1 && x <= sorted[at + 1][0]);
		const [x0, y0] = sorted[index];
		const [x1, y1] = sorted[index + 1];
		const h = x1 - x0;
		const t = (x - x0) / h;
		const t2 = t * t;
		const t3 = t2 * t;
		return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * h * slopes[index] + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * h * slopes[index + 1];
	};
}

function channelMap(adjustment: Adjustment): (value: number, channel: number) => number {
	switch (adjustment.type) {
		case 'curves': {
			const curve = spline(adjustment.curve);
			return (value) => curve(value);
		}
		case 'levels': {
			const { black, white, gamma, outBlack, outWhite } = adjustment.levels;
			return (value) => outBlack + (outWhite - outBlack) * Math.pow(Math.min(1, Math.max(0, (value - black) / Math.max(1e-4, white - black))), 1 / gamma);
		}
		case 'brightness': {
			const { brightness, contrast } = adjustment.brightness;
			return (value) => (value + brightness * 0.5 - 0.5) * Math.tan(((contrast + 1) * Math.PI) / 4) + 0.5;
		}
		case 'exposure': {
			const { exposure, offset, gamma } = adjustment.exposure;
			return (value) => Math.pow(Math.max(0, value * 2 ** exposure + offset), 1 / gamma);
		}
		default: {
			const { shadows, midtones, highlights } = adjustment.balance;
			return (value, channel) => {
				const shadow = Math.max(0, 1 - value * 3);
				const highlight = Math.max(0, value * 3 - 2);
				const middle = 1 - Math.abs(value - 0.5) * 2;
				return value + (shadows[channel] * shadow + midtones[channel] * middle + highlights[channel] * highlight) * 0.25;
			};
		}
	}
}

export function lutOf(adjustment: Adjustment) {
	const data = new Uint8Array(256 * 4);
	const map = channelMap(adjustment);
	for (let index = 0; index < 256; index++) {
		for (let channel = 0; channel < 3; channel++) data[index * 4 + channel] = Math.round(Math.min(1, Math.max(0, map(index / 255, channel))) * 255);
		data[index * 4 + 3] = 255;
	}
	return data;
}

export function shaderValues(adjustment: Adjustment, tint: [number, number, number]) {
	switch (adjustment.type) {
		case 'hue':
			return [adjustment.hue.hue, adjustment.hue.saturation, adjustment.hue.lightness, 0, 0, 0, 0, 0];
		case 'mono': {
			const { red, green, blue, tintAmount } = adjustment.mono;
			const total = Math.max(1e-4, red + green + blue);
			return [red / total, green / total, blue / total, 0, ...tint, tintAmount];
		}
		case 'vibrance':
			return [adjustment.vibrance.vibrance, adjustment.vibrance.saturation, 0, 0, 0, 0, 0, 0];
		default:
			return [0, 0, 0, 0, 0, 0, 0, 0];
	}
}
