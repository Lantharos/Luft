export type Layer = 'ink' | 'shade' | 'cut';

export interface Shape {
	tag: 'path' | 'rect' | 'circle';
	attributes: Record<string, string>;
	layer: Layer;
}

const ELEMENT = /<(\/?)(g|path|rect|circle)\b([^>]*?)\/?>/g;
const ATTRIBUTE = /([\w-]+)="([^"]*)"/g;
const LAYERS: Layer[] = ['ink', 'shade', 'cut'];

const attributesOf = (text: string) => Object.fromEntries([...text.matchAll(ATTRIBUTE)].map(([, name, value]) => [name, value]));

export function parseDrawing(name: string, svg: string): Shape[] {
	const shapes: Shape[] = [];
	let layer: Layer | null = null;
	for (const [, closing, tag, text] of svg.matchAll(ELEMENT)) {
		if (tag === 'g') {
			layer = closing ? null : (attributesOf(text).class as Layer);
			continue;
		}
		if (!layer || !LAYERS.includes(layer)) throw new Error(`Every shape in ${name} belongs in an ink, shade or cut group`);
		shapes.push({ tag: tag as Shape['tag'], attributes: attributesOf(text), layer });
	}
	return shapes;
}
