import type { VirtualHandle } from '@luft/ui';
import type { FileEntry } from '$lib/types';
import { Marquee } from '../listing/marquee.svelte';
import { DRAFT_PATH, withDraft } from './draft';
import type { EntryContext } from './entry-props';
import type { Viewport } from './view-state.svelte';

export class EntrySurface {
	scroller = $state<VirtualHandle>();
	readonly marquee: Marquee;
	readonly viewport: Viewport;
	#context: EntryContext;
	items: FileEntry[];
	offset: number;

	constructor(context: EntryContext, source = () => context.manager.displayEntries) {
		this.#context = context;
		this.items = $derived(withDraft(source(), context.manager.draft));
		this.offset = $derived(this.items.length - source().length);
		this.marquee = new Marquee(
			() => this.scroller,
			(index) => {
				const path = this.items[index]?.path;
				return path === DRAFT_PATH ? undefined : path;
			},
			context.view.select
		);
		this.viewport = {
			columns: () => this.scroller?.metrics().columns ?? 1,
			pageRows: () => this.scroller?.metrics().pageRows ?? 1,
			reveal: (index, center) => this.scroller?.scrollToIndex(index + this.offset, center ? 'center' : 'nearest'),
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
}
