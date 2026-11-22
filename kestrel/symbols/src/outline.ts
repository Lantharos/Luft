import CanvasKitInit, { type Path } from 'canvaskit-wasm';

import type { Layer, Shape } from './drawing.js';

const ck = await CanvasKitInit();
const TRANSFORM = /(translate|scale|rotate)\(([^)]*)\)/g;
const MIRROR = [-1, 0, 16, 0, 1, 0, 0, 0, 1];

const round = (value: number) => String(Math.round(value * 100) / 100);
const roundAll = (text: string) => text.replace(/-?\d*\.?\d+(?:e-?\d+)?/g, value => round(Number(value)));

function matrixOf(transform: string): number[] {
	return [...transform.matchAll(TRANSFORM)].reduce((matrix, [, kind, values]) => {
		const [first, second, third] = values.trim().split(/[\s,]+/).map(Number);
		const step = kind === 'translate' ? ck.Matrix.translated(first, second ?? 0)
			: kind === 'scale' ? ck.Matrix.scaled(first, second ?? first)
			: ck.Matrix.rotated(first * Math.PI / 180, second ?? 0, third ?? 0);
		return ck.Matrix.multiply(matrix, step);
	}, ck.Matrix.identity());
}

function filled(shape: Shape): Path {
	const number = (name: string) => Number(shape.attributes[name] ?? 0);
	const builder = shape.tag === 'path' ? new ck.PathBuilder(ck.Path.MakeFromSVGString(shape.attributes.d)!)
		: shape.tag === 'rect' ? new ck.PathBuilder().addRRect(ck.RRectXY(ck.XYWHRect(number('x'), number('y'), number('width'), number('height')), number('rx'), number('rx')))
		: new ck.PathBuilder().addCircle(number('cx'), number('cy'), number('r'));
	if (shape.attributes['fill-rule'] === 'evenodd') builder.setFillType(ck.FillType.EvenOdd);
	if (shape.attributes.transform) builder.transform(matrixOf(shape.attributes.transform));
	const path = builder.detachAndDelete();
	const width = shape.attributes['stroke-width'];
	return width ? path.makeStroked({ width: Number(width), cap: ck.StrokeCap.Round, join: ck.StrokeJoin.Round })! : path;
}

const empty = () => new ck.PathBuilder().detachAndDelete();
const op = (one: Path, two: Path, kind: typeof ck.PathOp.Union) => ck.Path.MakeFromOp(one, two, kind)!;

function painted(shapes: Shape[]) {
	const result: Record<Exclude<Layer, 'cut'>, Path> = { ink: empty(), shade: empty() };
	for (const shape of shapes) {
		const path = filled(shape);
		if (shape.layer === 'cut') {
			result.ink = op(result.ink, path, ck.PathOp.Difference);
			result.shade = op(result.shade, path, ck.PathOp.Difference);
		} else {
			result[shape.layer] = op(result[shape.layer], path, ck.PathOp.Union);
		}
	}
	return result;
}

function svgPath(path: Path, mirrored: boolean) {
	if (!mirrored) return roundAll(path.toSVGString());
	const builder = new ck.PathBuilder(path);
	builder.transform(MIRROR);
	return roundAll(builder.detachAndDelete().toSVGString());
}

export function layers(shapes: Shape[], mirrored: boolean) {
	const { ink, shade } = painted(shapes);
	return { ink: svgPath(ink, mirrored), shade: svgPath(op(shade, ink, ck.PathOp.Difference), mirrored) };
}
