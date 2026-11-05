import type { Component, Snippet } from 'svelte';
import { events as sabineEvents } from '@lantharos/sabine';
import { i18n } from '@luft/i18n';
import { appearance } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import { DEFAULT_PANEL, PANELS, resolveLink, type Panel, type PanelId } from '#lib/panels/registry.js';
import { hardware } from './hardware.svelte';
import { updates } from './updates.svelte';

export interface PanelView {
	panel: Panel;
	component: Component;
}

export interface OpenPage {
	title: string;
	actions?: Snippet;
	close: () => void;
}

interface Place {
	panel: PanelId;
	section: string | null;
}

const samePlace = (a: Place | undefined, b: Place) => a?.panel === b.panel && a.section === b.section;

class AppStore {
	panel = $state<PanelId>(DEFAULT_PANEL);
	view = $state.raw<PanelView | null>(null);
	query = $state('');
	#section = $state<string | null>(null);
	#pages = $state.raw<OpenPage[]>([]);
	#history = $state.raw<Place[]>([]);
	#index = $state(-1);
	#leaving = false;

	get section() {
		return this.#section;
	}

	set section(section: string | null) {
		this.#section = section;
		this.remember();
	}

	/** The sub-page shown in place of the panel, whose title heads the window. */
	get page(): OpenPage | null {
		return this.#pages.at(-1) ?? null;
	}

	get canGoBack() {
		return this.page !== null || this.#index > 0;
	}

	get canGoForward() {
		return this.#index < this.#history.length - 1;
	}

	showPage(page: OpenPage) {
		this.#pages = [...this.#pages, page];
		return () => (this.#pages = this.#pages.filter((shown) => shown !== page));
	}

	back() {
		if (this.page) this.leave(this.page);
		else if (this.#index > 0) this.visit(this.#index - 1);
	}

	private leave(page: OpenPage) {
		this.#leaving = true;
		try {
			page.close();
		} finally {
			this.#leaving = false;
		}
	}

	forward() {
		if (this.canGoForward) this.visit(this.#index + 1);
	}

	async start() {
		const [state] = await Promise.all([commands.appState(), hardware.start(), updates.start()]);
		appearance.start(state);
		await i18n.ready;
		sabineEvents.singleInstance(({ arguments: args }) => {
			const page = args.find((argument) => argument.startsWith('kestrel-settings:'));
			if (page) this.open(page);
		});
		const opened = state.page ? this.open(state.page) : undefined;
		if (!opened) this.remember();
		await (opened ?? this.show(this.panel));
		requestIdleCallback(() => PANELS.forEach((panel) => void panel.load()));
	}

	open(target: string) {
		const link = resolveLink(target);
		if (!link) return;
		this.panel = link.panel;
		this.query = '';
		this.section = link.section;
		return this.show(link.panel);
	}

	private remember() {
		const place = { panel: this.panel, section: this.#section };
		if (samePlace(this.#history[this.#index], place)) return;
		if (this.#leaving && samePlace(this.#history[this.#index - 1], place)) this.#index--;
		else {
			this.#history = [...this.#history.slice(0, this.#index + 1), place];
			this.#index = this.#history.length - 1;
		}
	}

	private visit(index: number) {
		const place = this.#history[index];
		this.#index = index;
		this.panel = place.panel;
		this.#section = place.section;
		this.query = '';
		void this.show(place.panel);
	}

	private async show(id: PanelId) {
		const panel = PANELS.find((entry) => entry.id === id)!;
		const { default: component } = await panel.load();
		if (this.panel === id) this.view = { panel, component };
	}
}

export const app = new AppStore();
