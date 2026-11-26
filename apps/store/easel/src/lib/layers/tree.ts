import type { Layer } from '#lib/document/layers.svelte.js';

export interface Row {
	layer: Layer;
	depth: number;
}

export function rows(layers: Layer[]): Row[] {
	const known = new Set(layers.map((layer) => layer.id));
	const children = new Map<string | null, Layer[]>();
	for (const layer of layers) {
		const parent = layer.parent && known.has(layer.parent) ? layer.parent : null;
		children.set(parent, [...(children.get(parent) ?? []), layer]);
	}
	const walk = (parent: string | null, depth: number): Row[] =>
		[...(children.get(parent) ?? [])].reverse().flatMap((layer) => [{ layer, depth }, ...(layer.kind === 'group' && !layer.collapsed ? walk(layer.id, depth + 1) : [])]);
	return walk(null, 0);
}
