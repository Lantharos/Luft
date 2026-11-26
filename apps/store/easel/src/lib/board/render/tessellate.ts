import { arrowHead } from '#lib/raster/shapes.js';
import type { Rgba } from '#lib/raster/color.js';

export const FLOATS = 6;
const CAP_STEPS = 10;
const ELLIPSE_STEPS = 72;

export class Mesh {
	data: number[] = [];

	triangle(color: Rgba, a: number[], b: number[], c: number[]) {
		this.data.push(a[0], a[1], ...color, b[0], b[1], ...color, c[0], c[1], ...color);
	}

	fan(color: Rgba, center: number[], ring: number[][]) {
		for (let at = 0; at < ring.length; at++) this.triangle(color, center, ring[at], ring[(at + 1) % ring.length]);
	}

	disc(color: Rgba, x: number, y: number, radius: number, steps = CAP_STEPS * 2) {
		this.fan(color, [x, y], Array.from({ length: steps }, (_, step) => [x + Math.cos((step / steps) * Math.PI * 2) * radius, y + Math.sin((step / steps) * Math.PI * 2) * radius]));
	}

	ribbon(color: Rgba, points: number[], widthAt: (index: number) => number, closed = false) {
		const count = points.length / 2;
		if (count < 2) return;
		const left: number[][] = [];
		const right: number[][] = [];
		for (let index = 0; index < count; index++) {
			const prev = closed ? (index - 1 + count) % count : Math.max(0, index - 1);
			const next = closed ? (index + 1) % count : Math.min(count - 1, index + 1);
			let dx = points[next * 2] - points[prev * 2];
			let dy = points[next * 2 + 1] - points[prev * 2 + 1];
			const length = Math.hypot(dx, dy) || 1;
			dx /= length;
			dy /= length;
			const half = widthAt(index) / 2;
			left.push([points[index * 2] - dy * half, points[index * 2 + 1] + dx * half]);
			right.push([points[index * 2] + dy * half, points[index * 2 + 1] - dx * half]);
		}
		const segments = closed ? count : count - 1;
		for (let index = 0; index < segments; index++) {
			const next = (index + 1) % count;
			this.triangle(color, left[index], right[index], left[next]);
			this.triangle(color, right[index], right[next], left[next]);
		}
	}

	stroke(color: Rgba, points: number[], width: number) {
		const flat: number[] = [];
		for (let at = 0; at < points.length; at += 3) flat.push(points[at], points[at + 1]);
		const widthAt = (index: number) => width * (0.35 + 0.65 * points[index * 3 + 2]);
		this.ribbon(color, flat, widthAt);
		const last = flat.length / 2 - 1;
		this.disc(color, flat[0], flat[1], widthAt(0) / 2, CAP_STEPS);
		this.disc(color, flat[last * 2], flat[last * 2 + 1], widthAt(last) / 2, CAP_STEPS);
	}

	outline(color: Rgba, ring: number[][], width: number) {
		this.ribbon(color, ring.flat(), () => width, true);
	}

	line(color: Rgba, from: number[], to: number[], width: number) {
		this.ribbon(color, [...from, ...to], () => width);
		this.disc(color, from[0], from[1], width / 2, CAP_STEPS);
		this.disc(color, to[0], to[1], width / 2, CAP_STEPS);
	}

	arrow(color: Rgba, from: [number, number], to: [number, number], width: number, head: boolean) {
		this.line(color, from, to, width);
		if (!head) return;
		const [left, tip, right] = arrowHead(from, to, width);
		this.line(color, left, tip, width);
		this.line(color, right, tip, width);
	}

	finish() {
		return new Float32Array(this.data);
	}
}

export function rectangleRing(x: number, y: number, w: number, h: number, radius: number) {
	const r = Math.min(radius, w / 2, h / 2);
	const ring: number[][] = [];
	const corner = (cx: number, cy: number, start: number) => {
		for (let step = 0; step <= CAP_STEPS / 2; step++) {
			const angle = start + (step / (CAP_STEPS / 2)) * (Math.PI / 2);
			ring.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
		}
	};
	corner(x + w - r, y + r, -Math.PI / 2);
	corner(x + w - r, y + h - r, 0);
	corner(x + r, y + h - r, Math.PI / 2);
	corner(x + r, y + r, Math.PI);
	return ring;
}

export function ellipseRing(x: number, y: number, w: number, h: number) {
	return Array.from({ length: ELLIPSE_STEPS }, (_, step) => {
		const angle = (step / ELLIPSE_STEPS) * Math.PI * 2;
		return [x + w / 2 + (Math.cos(angle) * w) / 2, y + h / 2 + (Math.sin(angle) * h) / 2];
	});
}

export function diamondRing(x: number, y: number, w: number, h: number) {
	return [
		[x + w / 2, y],
		[x + w, y + h / 2],
		[x + w / 2, y + h],
		[x, y + h / 2]
	];
}
