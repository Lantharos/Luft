import { t } from '@luft/i18n';
import type { PartKind, SpaceView } from '#lib/bindings.js';

export type TileKind = 'dir' | 'file' | 'other' | 'rest' | 'part';

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
	part?: PartKind;
}

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
				detail: item.done ? t('disks-space-items', { count: item.items }) : '',
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
			label: t('disks-space-small-files', { count: item.count }),
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
			label: t('disks-space-smaller-items', { count: view.hiddenCount }),
			size: view.hiddenSize,
			detail: '',
			inner: [],
			done: true,
			tone: 0
		});
	}
	return tiles;
}
