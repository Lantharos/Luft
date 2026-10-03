import { DEFAULT_LIST_COLUMNS, settings } from '#lib/state/settings.svelte.js';
import type { ListColumn, ListColumnId, SortBy } from '#lib/types/index.js';

const NAME_MIN_WIDTH = 220;
const COLUMN_GAP = 16;
const ROW_INSET = 40;
const MIN_WIDTH = 64;
const MAX_WIDTH = 480;

export const COLUMN_SORT: Record<ListColumnId, SortBy> = { date: 'date', size: 'size', kind: 'type' };
const LABELS: Record<ListColumnId, string> = { date: 'Modified', size: 'Size', kind: 'Kind' };

export function columnLabel(id: ListColumnId, recent: boolean) {
	return recent && id === 'kind' ? 'Location' : LABELS[id];
}

type Resizing = { id: ListColumnId; width: number };

export class ListColumns {
	width = $state(0);
	resizing = $state.raw<Resizing | null>(null);

	all = $derived(
		settings.value.listColumns.map((column) =>
			this.resizing?.id === column.id ? { ...column, width: this.resizing.width } : column
		)
	);
	shown = $derived(fit(this.all, this.width));
	template = $derived(['minmax(0, 1fr)', ...this.shown.map((column) => `${column.width}px`)].join(' '));

	resize = (id: ListColumnId, width: number) => {
		this.resizing = { id, width: Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width))) };
	};

	finishResize = () => {
		const resizing = this.resizing;
		if (!resizing) return;
		this.#save((columns) => columns.map((column) => (column.id === resizing.id ? { ...column, width: resizing.width } : column)));
		this.resizing = null;
	};

	toggle = (id: ListColumnId) => {
		this.#save((columns) => columns.map((column) => (column.id === id ? { ...column, visible: !column.visible } : column)));
	};

	move = (id: ListColumnId, before: ListColumnId | null) => {
		this.#save((columns) => {
			const moving = columns.find((column) => column.id === id)!;
			const rest = columns.filter((column) => column.id !== id);
			const index = before ? rest.findIndex((column) => column.id === before) : rest.length;
			return rest.toSpliced(index, 0, moving);
		});
	};

	reset = () => {
		this.#save(() => DEFAULT_LIST_COLUMNS);
	};

	#save(change: (columns: ListColumn[]) => ListColumn[]) {
		settings.update((current) => ({ ...current, listColumns: change(current.listColumns) }));
	}
}

function fit(columns: ListColumn[], width: number) {
	const visible = columns.filter((column) => column.visible);
	if (width === 0) return visible;
	let room = width - ROW_INSET - NAME_MIN_WIDTH;
	const shown: ListColumn[] = [];
	for (const column of visible) {
		room -= column.width + COLUMN_GAP;
		if (room < 0) break;
		shown.push(column);
	}
	return shown;
}
