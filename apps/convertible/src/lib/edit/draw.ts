import type { Mark, Point, Rect } from '#lib/bindings.js';

const HEAD_LENGTH = 4;
const HEAD_ANGLE = 0.5;
const HIGHLIGHT_OPACITY = 0.38;

export function fontFor(size: number) {
	return `500 ${size}px 'Open Runde'`;
}

function line(context: CanvasRenderingContext2D, from: Point, to: Point, color: string, width: number) {
	context.strokeStyle = color;
	context.lineWidth = width;
	context.lineCap = 'round';
	context.beginPath();
	context.moveTo(from.x, from.y);
	context.lineTo(to.x, to.y);
	context.stroke();
}

function arrowHead(context: CanvasRenderingContext2D, from: Point, to: Point, color: string, width: number) {
	const angle = Math.atan2(to.y - from.y, to.x - from.x);
	const length = width * HEAD_LENGTH;
	const corner = (side: number) => ({
		x: to.x - length * Math.cos(angle + side * HEAD_ANGLE),
		y: to.y - length * Math.sin(angle + side * HEAD_ANGLE)
	});
	const [left, right] = [corner(1), corner(-1)];
	context.fillStyle = color;
	context.beginPath();
	context.moveTo(to.x, to.y);
	context.lineTo(left.x, left.y);
	context.lineTo(right.x, right.y);
	context.closePath();
	context.fill();
}

export function drawCensor(context: CanvasRenderingContext2D, mark: Mark, picture: () => void) {
	if (mark.kind === 'redact') {
		context.fillStyle = '#000';
		context.fillRect(mark.area.x, mark.area.y, mark.area.width, mark.area.height);
	} else if (mark.kind === 'blur') {
		context.save();
		context.beginPath();
		context.rect(mark.area.x, mark.area.y, mark.area.width, mark.area.height);
		context.clip();
		context.filter = `${context.filter === 'none' ? '' : context.filter} blur(${mark.strength}px)`;
		picture();
		context.restore();
	}
}

export function drawMark(context: CanvasRenderingContext2D, mark: Mark) {
	switch (mark.kind) {
		case 'arrow':
			line(context, mark.from, mark.to, mark.color, mark.width);
			arrowHead(context, mark.from, mark.to, mark.color, mark.width);
			break;
		case 'line':
			line(context, mark.from, mark.to, mark.color, mark.width);
			break;
		case 'box':
			context.strokeStyle = mark.color;
			context.lineWidth = mark.width;
			context.beginPath();
			context.roundRect(mark.area.x, mark.area.y, mark.area.width, mark.area.height, mark.width);
			context.stroke();
			break;
		case 'ellipse':
			context.strokeStyle = mark.color;
			context.lineWidth = mark.width;
			context.beginPath();
			context.ellipse(mark.area.x + mark.area.width / 2, mark.area.y + mark.area.height / 2, mark.area.width / 2, mark.area.height / 2, 0, 0, Math.PI * 2);
			context.stroke();
			break;
		case 'highlight':
			context.fillStyle = mark.color;
			context.globalAlpha = HIGHLIGHT_OPACITY;
			context.fillRect(mark.area.x, mark.area.y, mark.area.width, mark.area.height);
			context.globalAlpha = 1;
			break;
		case 'text':
			context.fillStyle = mark.color;
			context.font = fontFor(mark.size);
			context.textBaseline = 'alphabetic';
			context.fillText(mark.text, mark.at.x, mark.at.y);
			break;
	}
}

export function normalized(from: Point, to: Point): Rect {
	return { x: Math.min(from.x, to.x), y: Math.min(from.y, to.y), width: Math.abs(to.x - from.x), height: Math.abs(to.y - from.y) };
}

function nearSegment(point: Point, from: Point, to: Point, reach: number) {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const span = dx * dx + dy * dy || 1;
	const along = Math.max(0, Math.min(1, ((point.x - from.x) * dx + (point.y - from.y) * dy) / span));
	return Math.hypot(point.x - from.x - along * dx, point.y - from.y - along * dy) <= reach;
}

export function hit(mark: Mark, point: Point, reach: number) {
	if ('from' in mark) return nearSegment(point, mark.from, mark.to, reach + mark.width);
	if ('at' in mark) return point.x >= mark.at.x && point.x <= mark.at.x + mark.text.length * mark.size * 0.6 && point.y <= mark.at.y && point.y >= mark.at.y - mark.size;
	const { x, y, width, height } = mark.area;
	return point.x >= x - reach && point.x <= x + width + reach && point.y >= y - reach && point.y <= y + height + reach;
}

export function moved(mark: Mark, dx: number, dy: number): Mark {
	const shift = (point: Point) => ({ x: point.x + dx, y: point.y + dy });
	if ('from' in mark) return { ...mark, from: shift(mark.from), to: shift(mark.to) };
	if ('at' in mark) return { ...mark, at: shift(mark.at) };
	return { ...mark, area: { ...mark.area, x: mark.area.x + dx, y: mark.area.y + dy } };
}
