import { appearance } from '@luft/ui';

export type Tone = 'accent' | 'soft';

export interface Line {
	values: (number | null)[];
	tone?: Tone;
	fill?: boolean;
}

export interface Frame {
	width: number;
	height: number;
	step: number;
	capacity: number;
	max: number;
	thickness: number;
	inset: number;
}

const FILL_ALPHA = 0.14;

const TONES: Record<Tone, string> = {
	accent: '--accent',
	soft: '--text-soft'
};

function roundUp(value: number) {
	const magnitude = 10 ** Math.floor(Math.log10(value));
	const scaled = value / magnitude;
	const nice = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 2.5 ? 2.5 : scaled <= 5 ? 5 : 10;
	return nice * magnitude;
}

export function niceCeiling(value: number, floor: number, binary = false) {
	const target = Math.max(value * 1.08, floor);
	if (!binary) return roundUp(target);
	const unit = 1024 ** Math.max(0, Math.floor(Math.log(target) / Math.log(1024)));
	return unit * roundUp(target / unit);
}

export function peak(lines: Line[], capacity: number) {
	let highest = 0;
	for (const line of lines) {
		const start = Math.max(0, line.values.length - capacity - 1);
		for (let index = start; index < line.values.length; index++) {
			const value = line.values[index];
			if (value !== null && value > highest) highest = value;
		}
	}
	return highest;
}

export function draw(canvas: HTMLCanvasElement, lines: Line[], frame: Frame) {
	const context = canvas.getContext('2d', { willReadFrequently: true });
	if (!context) return;
	const ratio = devicePixelRatio || 1;
	const pixelWidth = Math.round((frame.width + frame.step) * ratio);
	const pixelHeight = Math.round(frame.height * ratio);
	if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
		canvas.width = pixelWidth;
		canvas.height = pixelHeight;
	}
	context.setTransform(ratio, 0, 0, ratio, 0, 0);
	context.clearRect(0, 0, frame.width + frame.step, frame.height);
	for (const line of [...lines].reverse()) {
		const color = palette(canvas)[line.tone ?? 'accent'];
		trace(context, line.values, frame);
		if (line.fill !== false) {
			context.save();
			context.lineTo(frame.width + frame.step, frame.height);
			context.lineTo(xOf(Math.max(0, line.values.length - frame.capacity - 1), line.values.length, frame), frame.height);
			context.closePath();
			context.globalAlpha = FILL_ALPHA;
			context.fillStyle = color;
			context.fill();
			context.restore();
			trace(context, line.values, frame);
		}
		context.lineWidth = frame.thickness;
		context.lineJoin = 'round';
		context.lineCap = 'round';
		context.strokeStyle = color;
		context.stroke();
	}
}

let colors: { key: string; values: Record<Tone, string> } | null = null;

function palette(element: Element): Record<Tone, string> {
	const key = `${document.documentElement.dataset.scheme}|${appearance.accent}`;
	if (colors?.key !== key) {
		const style = getComputedStyle(element);
		const values = Object.fromEntries(Object.entries(TONES).map(([tone, variable]) => [tone, style.getPropertyValue(variable).trim()])) as Record<Tone, string>;
		colors = { key, values };
	}
	return colors.values;
}

function xOf(index: number, count: number, frame: Frame) {
	return frame.width + frame.step - (count - 1 - index) * frame.step;
}

function yOf(value: number, frame: Frame) {
	const usable = frame.height - frame.inset * 2;
	return frame.height - frame.inset - Math.min(1, Math.max(0, value / frame.max)) * usable;
}

function trace(context: CanvasRenderingContext2D, values: (number | null)[], frame: Frame) {
	context.beginPath();
	const first = Math.max(0, values.length - frame.capacity - 1);
	let previous: { x: number; y: number } | null = null;
	for (let index = first; index < values.length; index++) {
		const value = values[index];
		if (value === null) {
			previous = null;
			continue;
		}
		const point = { x: xOf(index, values.length, frame), y: yOf(value, frame) };
		if (!previous) context.moveTo(point.x, point.y);
		else context.quadraticCurveTo(previous.x, previous.y, (previous.x + point.x) / 2, (previous.y + point.y) / 2);
		previous = point;
	}
	if (previous) context.lineTo(previous.x, previous.y);
}
