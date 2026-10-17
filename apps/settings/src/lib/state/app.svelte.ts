import type { Component } from 'svelte';
import { appearance } from '@luft/ui';
import { appState, onActivated } from '#lib/bridge.js';
import { DEFAULT_PANEL, PANELS, resolveLink, type Panel, type PanelId } from '#lib/panels/registry.js';
import { hardware } from './hardware.svelte';
import { updates } from './updates.svelte';

export interface PanelView {
	panel: Panel;
	component: Component;
}

class AppStore {
	panel = $state<PanelId>(DEFAULT_PANEL);
	view = $state.raw<PanelView | null>(null);
	section = $state<string | null>(null);
	query = $state('');

	async start() {
		const [state] = await Promise.all([appState(), hardware.start(), updates.start()]);
		appearance.start(state);
		onActivated(({ arguments: args }) => {
			const page = args.find((argument) => argument.startsWith('kestrel-settings:'));
			if (page) this.open(page);
		});
		const opened = state.page ? this.open(state.page) : undefined;
		await (opened ?? this.show(this.panel));
		requestIdleCallback(() => PANELS.forEach((panel) => void panel.load()));
	}

	open(target: string) {
		const link = resolveLink(target);
		if (!link) return;
		this.panel = link.panel;
		this.section = link.section;
		this.query = '';
		return this.show(link.panel);
	}

	private async show(id: PanelId) {
		const panel = PANELS.find((entry) => entry.id === id)!;
		const { default: component } = await panel.load();
		if (this.panel === id) this.view = { panel, component };
	}
}

export const app = new AppStore();
