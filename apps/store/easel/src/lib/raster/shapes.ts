export type ShapeKind = 'rectangle' | 'ellipse' | 'line' | 'arrow';

export interface ShapeSpec {
	kind: ShapeKind;
	from: [number, number];
	to: [number, number];
	color: string;
	width: number;
	filled: boolean;
}

export function arrowHead(from: [number, number], to: [number, number], width: number) {
	const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
	const size = Math.max(10, width * 3.2);
	const wing = (turn: number): [number, number] => [to[0] - Math.cos(angle + turn) * size, to[1] - Math.sin(angle + turn) * size];
	return [wing(0.5), to, wing(-0.5)] as const;
}

export function drawShape(context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, shape: ShapeSpec) {
	const [x0, y0] = shape.from;
	const [x1, y1] = shape.to;
	context.strokeStyle = context.fillStyle = shape.color;
	context.lineWidth = shape.width;
	context.lineCap = 'round';
	context.lineJoin = 'round';
	context.beginPath();
	if (shape.kind === 'rectangle') context.rect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
	else if (shape.kind === 'ellipse') context.ellipse((x0 + x1) / 2, (y0 + y1) / 2, Math.abs(x1 - x0) / 2, Math.abs(y1 - y0) / 2, 0, 0, Math.PI * 2);
	else {
		context.moveTo(x0, y0);
		context.lineTo(x1, y1);
		if (shape.kind === 'arrow') {
			const [left, tip, right] = arrowHead(shape.from, shape.to, shape.width);
			context.moveTo(...left);
			context.lineTo(...tip);
			context.lineTo(...right);
		}
	}
	if (shape.filled && (shape.kind === 'rectangle' || shape.kind === 'ellipse')) context.fill();
	else context.stroke();
}

export function shapeBounds(shape: ShapeSpec) {
	const reach = shape.width * 4 + 2;
	const x = Math.min(shape.from[0], shape.to[0]) - reach;
	const y = Math.min(shape.from[1], shape.to[1]) - reach;
	return { x, y, width: Math.abs(shape.to[0] - shape.from[0]) + reach * 2, height: Math.abs(shape.to[1] - shape.from[1]) + reach * 2 };
}
