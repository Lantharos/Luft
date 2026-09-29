import type { VirtualHandle } from '@luft/ui';
import type { FileEntry } from '$lib/types';
import type { Section } from '../listing/groups';
import { Marquee } from '../listing/marquee.svelte';
import { DRAFT_PATH, withDraft } from './draft';
import type { EntryContext } from './entry-props';
import type { Viewport } from './view-state.svelte';

export type GroupRow = { group: string; label: string; count: number };
export type SurfaceRow = FileEntry | GroupRow;

export function isGroupRow(row: SurfaceRow): row is GroupRow {
	return 'group' in row;
}

export class EntrySurface {
	scroller = $state<VirtualHandle>();
	readonly marquee: Marquee;
	readonly viewport: Viewport;
	#context: EntryContext;
	#sections: () => Section[] | null;
	items: FileEntry[];
	rows: SurfaceRow[];
	offset: number;

	constructor(context: EntryContext, source = () => context.manager.displayEntries, sections = () => null as Section[] | null) {
		this.#context = context;
		this.#sections = sections;
		this.items = $derived(withDraft(source(), context.manager.draft));
		this.offset = $derived(this.items.length - source().length);
		this.rows = $derived(interleave(this.items, this.offset, sections()));
		this.marquee = new Marquee(
			() => this.scroller,
			(index) => {
				const row = this.rows[index];
				return !row || isGroupRow(row) || row.path === DRAFT_PATH ? undefined : row.path;
			},
			context.view.select
		);
		this.viewport = {
			columns: () => this.scroller?.metrics().columns ?? 1,
			pageRows: () => this.scroller?.metrics().pageRows ?? 1,
			reveal: (index, center) => this.scroller?.scrollToIndex(this.#rowIndex(index), center ? 'center' : 'nearest'),
			scrollTop: () => this.scroller?.element()?.scrollTop ?? 0,
			scrollTo: (top) => this.scroller?.element()?.scrollTo({ top })
		};
	}

	pointerHandlers() {
		const { manager, chooser } = this.#context;
		return {
			onpointerdown: (event: PointerEvent) => this.marquee.start(event, manager.selection),
			onpointermove: this.marquee.move,
			onpointerup: this.marquee.end,
			onpointercancel: this.marquee.end,
			onscroll: this.marquee.scroll,
			oncontextmenu: (event: MouseEvent) => (chooser ? event.preventDefault() : manager.openContextMenu(event))
		};
	}

	#rowIndex(index: number) {
		let headers = 0;
		let end = 0;
		for (const section of this.#sections() ?? []) {
			headers++;
			end += section.count;
			if (index < end) break;
		}
		return index + this.offset + headers;
	}
}

function interleave(items: FileEntry[], offset: number, sections: Section[] | null): SurfaceRow[] {
	if (!sections) return items;
	const rows: SurfaceRow[] = items.slice(0, offset);
	let start = offset;
	for (const section of sections) {
		rows.push({ group: section.key, label: section.label, count: section.count });
		for (let index = start; index < start + section.count; index++) rows.push(items[index]);
		start += section.count;
	}
	return rows;
}
