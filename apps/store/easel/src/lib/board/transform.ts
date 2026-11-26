import type { BoardObject, End } from './model';

export function moved(object: BoardObject, dx: number, dy: number): BoardObject {
	const end = (point: End): End => (point.attach ? point : { x: point.x + dx, y: point.y + dy });
	switch (object.kind) {
		case 'stroke':
			return { ...object, points: object.points.map((value, index) => (index % 3 === 0 ? value + dx : index % 3 === 1 ? value + dy : value)) };
		case 'arrow':
			return { ...object, from: end(object.from), to: end(object.to) };
		default:
			return { ...object, x: object.x + dx, y: object.y + dy };
	}
}

export function scaled(object: BoardObject, ox: number, oy: number, sx: number, sy: number): BoardObject {
	const x = (value: number) => ox + (value - ox) * sx;
	const y = (value: number) => oy + (value - oy) * sy;
	switch (object.kind) {
		case 'stroke':
			return { ...object, points: object.points.map((value, index) => (index % 3 === 0 ? x(value) : index % 3 === 1 ? y(value) : value)), width: object.width * Math.sqrt(Math.abs(sx * sy)) };
		case 'arrow':
			return { ...object, from: { ...object.from, x: x(object.from.x), y: y(object.from.y) }, to: { ...object.to, x: x(object.to.x), y: y(object.to.y) } };
		case 'text':
			return { ...object, x: x(object.x), y: y(object.y), size: Math.max(4, object.size * Math.sqrt(Math.abs(sx * sy))) };
		default: {
			const left = x(object.x);
			const top = y(object.y);
			const right = x(object.x + object.w);
			const bottom = y(object.y + object.h);
			return { ...object, x: Math.min(left, right), y: Math.min(top, bottom), w: Math.abs(right - left), h: Math.abs(bottom - top) };
		}
	}
}
