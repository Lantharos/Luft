import type { SpaceView } from '#lib/api.js';
import { bytes } from '#lib/format.js';

export type TileKind = 'dir' | 'file' | 'other' | 'rest';

export interface Tile {
	key: string;
	kind: TileKind;
	name: string;
	label: string;
	size: number;
	detail: string;
	inner: number[];
	done: boolean;
	tone: number;
}

const count = (value: number, one: string, many: string) => `${value.toLocaleString()} ${value === 1 ? one : many}`;

export function tilesOf(view: SpaceView): Tile[] {
	let folders = 0;
	const tiles: Tile[] = view.children.map((item) => {
		if (item.kind === 'dir') {
			return {
				key: `dir:${item.name}`,
				kind: 'dir',
				name: item.name,
				label: item.name,
				size: item.size,
				detail: item.done ? count(item.items, 'item', 'items') : 'Measuring…',
				inner: item.inner,
				done: item.done,
				tone: folders++ % 3
			};
		}
		if (item.kind === 'file') {
			return { key: `file:${item.name}`, kind: 'file', name: item.name, label: item.name, size: item.size, detail: '', inner: [], done: true, tone: 0 };
		}
		return {
			key: 'other',
			kind: 'other',
			name: '',
			label: count(item.count, 'small file', 'small files'),
			size: item.size,
			detail: '',
			inner: [],
			done: true,
			tone: 0
		};
	});
	if (view.hiddenCount > 0) {
		tiles.push({
			key: 'rest',
			kind: 'rest',
			name: '',
			label: count(view.hiddenCount, 'smaller item', 'smaller items'),
			size: view.hiddenSize,
			detail: '',
			inner: [],
			done: true,
			tone: 0
		});
	}
	return tiles;
}

export function tileSize(tile: Tile) {
	return bytes(tile.size);
}
