import { requests } from '#lib/app/requests.svelte.js';
import { session } from '#lib/app/session.svelte.js';
import type { PageFlow } from '#lib/app/settings.svelte.js';
import { appState } from '#lib/app/state.js';
import { arrangement } from '#lib/app/arrangement.svelte.js';
import { pageNear } from '#lib/canvas/layout.js';
import { Ruler } from '#lib/canvas/ruler/ruler.svelte.js';
import { Viewport } from '#lib/canvas/viewport.svelte.js';
import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
import { t } from '@luft/i18n';
import { addPicture, addPictureFiles, addQuote, choosePictures, draftText, editing } from '#lib/objects/editing.svelte.js';
import { pageSize, paperOf, type PageEntry } from '#lib/library/model.js';
import { linesOf } from '#lib/typing/flow.js';
import { selection } from '#lib/selection/selection.svelte.js';
import type { ToolbarActions } from '#lib/tools/Toolbar.svelte';

interface Place {
	zoom: number;
	x: number;
	y: number;
}

const SAVE_AFTER = 600;
const DEFAULT_LEFT = 40;

export class Pane {
	readonly viewport = new Viewport();
	readonly ruler = new Ruler();
	placed = $state(false);
	private saveTimer = 0;

	constructor(readonly notebook: OpenNotebook) {}

	get current() {
		const { viewport } = this;
		if (viewport.single !== null) return viewport.single;
		return viewport.layout.pages.length ? pageNear(viewport.layout, (viewport.y + viewport.height / 3) / viewport.zoom) : 0;
	}

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
		if (!place || arrangement.tablet || first.width * viewport.zoom > viewport.width) viewport.fitWidth(first);
	}

	follow() {
		const target = session.goTo;
		if (!this.placed || !target || target.notebook !== this.notebook.meta.id) return;
		const index = this.notebook.indexOf(target.page);
		if (index >= 0 && this.viewport.layout.pages[index]) {
			this.viewport.showPage(index);
			session.goTo = null;
		}
	}

	flow(pages: PageFlow) {
		const { viewport } = this;
		if (!this.placed || (pages === 'single') === (viewport.single !== null)) return;
		const current = this.current;
		viewport.setSingle(pages === 'single' ? current : null);
		viewport.showPage(current);
	}

	remember(place: Place) {
		if (!this.placed) return;
		clearTimeout(this.saveTimer);
		this.saveTimer = window.setTimeout(() => {
			const places = appState.get<Record<string, Place>>('places') ?? {};
			void appState.save({ places: { ...places, [this.notebook.meta.id]: place } });
		}, SAVE_AFTER);
	}

	get page() {
		const entry = this.notebook.meta.pages[this.current];
		const store = entry && this.notebook.store(entry.id);
		return store ? { entry, document: store.document, rect: this.viewport.layout.pages[this.current] } : null;
	}

	private async insertPictures() {
		const paths = await choosePictures(t('picture-choose-title'), t('picture-choose-filter'));
		const page = this.page;
		if (page) await addPictureFiles(page.document, this.notebook.folder, page.rect, paths);
	}

	async addPhoto(bytes: Uint8Array) {
		const page = this.page;
		const object = page && (await addPicture(page.document, this.notebook.folder, page.rect, bytes, 'photo.jpg'));
		if (object) editing.crop = object.id;
	}

	quote(text: string) {
		const page = this.page;
		if (page) addQuote(page.document, page.rect.width, text);
	}

	private typeOn(page: PageEntry) {
		const lines = linesOf(this.notebook, page);
		const { width } = pageSize(paperOf(this.notebook.meta, page), page);
		draftText(page.id, lines, lines.margin || DEFAULT_LEFT, lines.first, width, true);
	}

	jump(index: number) {
		this.viewport.showPage(index);
	}

	readonly actions: ToolbarActions = {
		undo: () => this.notebook.undo(),
		redo: () => this.notebook.redo(),
		addPage: () => {
			const page = this.notebook.addPage(this.current + 1);
			session.goTo = { notebook: this.notebook.meta.id, page: page.id };
			if (this.notebook.meta.typed) this.typeOn(page);
		},
		fitWidth: () => this.viewport.fitWidth(this.viewport.layout.pages[this.current]),
		fitPage: () => this.viewport.fitPage(this.viewport.layout.pages[this.current]),
		actualSize: () => this.viewport.zoomAt(1, this.viewport.width / 2, this.viewport.height / 2),
		paste: () => {
			const page = this.notebook.meta.pages[this.current];
			const store = page && this.notebook.store(page.id);
			if (store) selection.paste(page.id, store.document);
		},
		insertPicture: () => void this.insertPictures(),
		takePhoto: () => (requests.photo = true),
		paper: () => (requests.paper = true),
		toggleRuler: () => this.ruler.toggle(this.viewport.width, this.viewport.height),
		zoomBy: (factor) => this.viewport.zoomAt(this.viewport.zoom * factor, this.viewport.width / 2, this.viewport.height / 2)
	};
}
