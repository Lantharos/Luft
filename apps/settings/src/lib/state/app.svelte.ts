import { appearance } from '@luft/ui';
import { appState, onActivated } from '#lib/bridge.js';
import { DEFAULT_PANEL, resolveLink, type PanelId } from '#lib/panels/registry.js';
import { hardware } from './hardware.svelte';

class AppStore {
	panel = $state<PanelId>(DEFAULT_PANEL);
	section = $state<string | null>(null);
	query = $state('');

	async start() {
		const [state] = await Promise.all([appState(), hardware.start()]);
		appearance.start(state);
		if (state.page) this.open(state.page);
		onActivated(({ arguments: args }) => {
			const page = args.find((argument) => argument.startsWith('kestrel-settings:'));
			if (page) this.open(page);
		});
	}

	open(target: string) {
		const link = resolveLink(target);
		if (!link) return;
		this.panel = link.panel;
		this.section = link.section;
		this.query = '';
	}
}

export const app = new AppStore();
