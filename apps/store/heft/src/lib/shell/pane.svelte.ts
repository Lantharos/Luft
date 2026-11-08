import { session } from '#lib/app/session.svelte.js';
import { appState } from '#lib/app/state.js';
import { pageNear } from '#lib/canvas/layout.js';
import { Viewport } from '#lib/canvas/viewport.svelte.js';
import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
import type { ToolbarActions } from '#lib/tools/Toolbar.svelte';

interface Place {
	zoom: number;
	x: number;
	y: number;
}

const SAVE_AFTER = 600;

/** One notebook on screen, scrolled and zoomed on its own, and remembered that way. */
export class Pane {
	readonly viewport = new Viewport();
	placed = false;
	private saveTimer = 0;

	constructor(readonly notebook: OpenNotebook) {}

	get current() {
		const { viewport } = this;
		return viewport.layout.pages.length ? pageNear(viewport.layout, (viewport.y + viewport.height / 3) / viewport.zoom) : 0;
	}

	/** Puts the notebook back where it was left, once the pane knows its size. */
	place() {
		const { viewport } = this;
		if (this.placed || !viewport.width || !viewport.layout.pages.length) return;
		this.placed = true;
		const place = appState.get<Record<string, Place>>('places')?.[this.notebook.meta.id];
		if (place) {
			viewport.zoom = place.zoom;
			viewport.x = place.x;
			viewport.y = place.y;
			viewport.clamp();
		}
		const first = viewport.layout.pages[0];
		if (!place || first.width * viewport.zoom > viewport.width) viewport.fitWidth(first);
	}

	follow() {
		const target = session.goTo;
		if (!this.placed || !target || target.notebook !== this.notebook.meta.id) return;
		const index = this.notebook.indexOf(target.page);
		if (index >= 0 && this.viewport.layout.pages[index]) {
			this.viewport.scrollToPage(this.viewport.layout.pages[index]);
			session.goTo = null;
		}
	}

	remember(place: Place) {
		if (!this.placed) return;
		clearTimeout(this.saveTimer);
		this.saveTimer = window.setTimeout(() => {
			const places = appState.get<Record<string, Place>>('places') ?? {};
			void appState.save({ places: { ...places, [this.notebook.meta.id]: place } });
		}, SAVE_AFTER);
	}

	jump(index: number) {
		this.viewport.scrollToPage(this.viewport.layout.pages[index]);
	}

	readonly actions: ToolbarActions = {
		undo: () => this.notebook.undo(),
		redo: () => this.notebook.redo(),
		addPage: () => {
			const page = this.notebook.addPage(this.current + 1);
			session.goTo = { notebook: this.notebook.meta.id, page: page.id };
		},
		fitWidth: () => this.viewport.fitWidth(this.viewport.layout.pages[this.current]),
		fitPage: () => this.viewport.fitPage(this.viewport.layout.pages[this.current]),
		actualSize: () => this.viewport.zoomAt(1, this.viewport.width / 2, this.viewport.height / 2),
		zoomBy: (factor) => this.viewport.zoomAt(this.viewport.zoom * factor, this.viewport.width / 2, this.viewport.height / 2)
	};
}
