import CanvasKitInit, { type Path } from 'canvaskit-wasm';

import { isStroke, type Shape } from './drawing.js';

const ck = await CanvasKitInit();
const CROP = 1.16;
const TRANSFORM = /(translate|scale|rotate)\(([^)]*)\)/g;

const round = (value: number) => String(Math.round(value * 100) / 100);
const roundAll = (text: string) => text.replace(/-?\d*\.\d+(?:e-?\d+)?/g, value => round(Number(value)));

function matrixOf(transform: string): number[] {
	return [...transform.matchAll(TRANSFORM)].reduce((matrix, [, kind, values]) => {
		const [first, second, third] = values.trim().split(/[\s,]+/).map(Number);
		const step = kind === 'translate' ? ck.Matrix.translated(first, second ?? 0)
			: kind === 'scale' ? ck.Matrix.scaled(first, second ?? first)
			: ck.Matrix.rotated(first * Math.PI / 180, second ?? 0, third ?? 0);
		return ck.Matrix.multiply(matrix, step);
	}, ck.Matrix.identity());
}

function outline(shape: Shape): Path {
	const number = (name: string) => Number(shape.attributes[name] ?? 0);
	const builder = shape.tag === 'path' ? new ck.PathBuilder(ck.Path.MakeFromSVGString(shape.attributes.d)!)
		: shape.tag === 'rect' ? new ck.PathBuilder().addRRect(ck.RRectXY(ck.XYWHRect(number('x'), number('y'), number('width'), number('height')), number('rx'), number('rx')))
		: new ck.PathBuilder().addCircle(number('cx'), number('cy'), number('r'));
	if (shape.attributes['fill-rule'] === 'evenodd') builder.setFillType(ck.FillType.EvenOdd);
	if (shape.attributes.transform) builder.transform(matrixOf(shape.attributes.transform));
	const path = builder.detachAndDelete();
	return isStroke(shape) ? path.makeStroked({ width: number('stroke-width'), cap: ck.StrokeCap.Round, join: ck.StrokeJoin.Round })! : path;
}

function crop(paths: Path[]): string {
	const [left, top, right, bottom] = paths.map(path => path.computeTightBounds()).reduce((all, bounds) =>
		Float32Array.of(Math.min(all[0], bounds[0]), Math.min(all[1], bounds[1]), Math.max(all[2], bounds[2]), Math.max(all[3], bounds[3])));
	const side = Math.max(right - left, bottom - top) * CROP;
	return [(left + right - side) / 2, (top + bottom - side) / 2, side, side].map(round).join(' ');
}

const SHADE = { class: 'success' };

function element(shape: Shape): string {
	const { opacity } = shape.attributes;
	const { tag, attributes } = isStroke(shape)
		? { tag: 'path', attributes: { ...opacity && { opacity }, d: roundAll(outline(shape).toSVGString()) } }
		: shape;
	const named = { ...shape.layer === 'shade' && SHADE, ...attributes };
	return `<${tag} ${Object.entries(named).map(([name, value]) => `${name}="${value}"`).join(' ')}/>`;
}

export const glyph = (shapes: Shape[]) =>
	`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="${crop(shapes.map(outline))}" fill="#2e3436">${shapes.map(element).join('')}</svg>\n`;
