export type Layer = 'ink' | 'shade';

export interface Shape {
	tag: 'path' | 'rect' | 'circle';
	attributes: Record<string, string>;
	layer: Layer;
}

const ELEMENT = /<(\/?)(g|path|rect|circle)\b([^>]*?)\/?>/g;
const ATTRIBUTE = /([\w-]+)="([^"]*)"/g;
const LAYERS: Layer[] = ['ink', 'shade'];

const attributesOf = (text: string) => Object.fromEntries([...text.matchAll(ATTRIBUTE)].map(([, name, value]) => [name, value]));

export function parseDrawing(name: string, svg: string): Shape[] {
	const shapes: Shape[] = [];
	let layer: Layer | null = null;
	for (const [, closing, tag, text] of svg.matchAll(ELEMENT)) {
		if (tag === 'g') {
			layer = closing ? null : (attributesOf(text).class as Layer);
			continue;
		}
		if (!layer || !LAYERS.includes(layer)) throw new Error(`Every shape in ${name} belongs in an ink or a shade group`);
		shapes.push({ tag: tag as Shape['tag'], attributes: attributesOf(text), layer });
	}
	return shapes;
}

export const isStroke = (shape: Shape) => 'stroke-width' in shape.attributes;

export function runs<T>(items: T[], same: (first: T, second: T) => boolean): T[][] {
	const grouped: T[][] = [];
	for (const item of items) {
		const last = grouped.at(-1);
		if (last && same(last[0], item)) last.push(item);
		else grouped.push([item]);
	}
	return grouped;
}
