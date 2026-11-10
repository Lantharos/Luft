import { curve, widthAt } from './pressure';
import { Stabilizer } from './smoothing';
import { newId, POINT_FIELDS, strokeBounds, type Nib, type Stroke, type Tool } from './stroke';

export interface Pen {
	tool: Tool;
	nib: Nib;
	color: number;
	width: number;
}

export interface Feel {
	firmness: number;
	stabilization: number;
}

const MIN_STEP = 0.35;

export class StrokeBuilder {
	points = new Float32Array(256 * POINT_FIELDS);
	length = 0;
	private readonly stabilizer: Stabilizer;
	private readonly started: number;
	private lastTime: number;
	private raw: [number, number, number, number] = [0, 0, 0, 0];

	constructor(
		readonly pen: Pen,
		private readonly feel: Feel,
		time: number
	) {
		this.stabilizer = new Stabilizer(pen.tool === 'highlighter' ? Math.max(feel.stabilization, 0.5) : feel.stabilization);
		this.started = Date.now();
		this.lastTime = time;
	}

	get count() {
		return this.length / POINT_FIELDS;
	}

	width(pressure: number) {
		return widthAt(this.pen.tool, this.pen.nib, this.pen.width, curve(pressure, this.feel.firmness));
	}

	add(x: number, y: number, pressure: number, time: number): boolean {
		this.raw = [x, y, pressure, time];
		const [sx, sy, sp] = this.stabilizer.next(x, y, pressure, time);
		return this.push(sx, sy, sp, time);
	}

	finish(): boolean {
		const [x, y, pressure, time] = this.raw;
		return this.count > 0 && this.push(x, y, pressure, time);
	}

	private push(x: number, y: number, pressure: number, time: number): boolean {
		const width = this.width(pressure);
		if (this.length) {
			const at = this.length - POINT_FIELDS;
			if (Math.hypot(x - this.points[at], y - this.points[at + 1]) < MIN_STEP) return false;
		}
		if (this.length + POINT_FIELDS > this.points.length) {
			const grown = new Float32Array(this.points.length * 2);
			grown.set(this.points);
			this.points = grown;
		}
		this.points.set([x, y, width, pressure, Math.max(0, time - this.lastTime)], this.length);
		this.lastTime = time;
		this.length += POINT_FIELDS;
		return true;
	}

	prediction(samples: [number, number, number][]): Float32Array {
		const last = this.points.subarray(this.length - POINT_FIELDS, this.length);
		const points = new Float32Array((samples.length + 1) * POINT_FIELDS);
		points.set(last);
		samples.forEach(([x, y, pressure], index) => points.set([x, y, this.width(pressure), pressure, 0], (index + 1) * POINT_FIELDS));
		return points;
	}

	build(order: number): Stroke {
		const points = this.points.slice(0, this.length);
		return {
			id: newId(),
			order,
			tool: this.pen.tool,
			nib: this.pen.nib,
			color: this.pen.color,
			width: this.pen.width,
			started: this.started,
			points,
			bounds: strokeBounds(points)
		};
	}
}
