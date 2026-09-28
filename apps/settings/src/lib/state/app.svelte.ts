import { appearance } from '@luft/ui';
import { appState, onActivated } from '$lib/bridge';
import { DEFAULT_PANEL, resolvePanel, type PanelId } from '$lib/panels/registry';

class AppStore {
	panel = $state<PanelId>(DEFAULT_PANEL);
	query = $state('');

	async start() {
		const state = await appState();
		appearance.start(state);
		if (state.page) this.open(state.page);
		onActivated(({ arguments: args }) => {
			const page = args.find((argument) => argument.startsWith('kestrel-settings:'));
			if (page) this.open(page);
		});
	}

	open(target: string) {
		const panel = resolvePanel(target);
		if (panel) {
			this.panel = panel;
			this.query = '';
		}
	}
}

export const app = new AppStore();
