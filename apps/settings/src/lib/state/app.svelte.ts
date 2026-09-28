import { appState, onAccentChanged, onActivated } from '$lib/bridge';
import { DEFAULT_PANEL, resolvePanel, type PanelId } from '$lib/panels/registry';

function readableOn(hex: string) {
	const [red, green, blue] = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
	const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
	return luminance > 0.5 ? '#181817' : '#f7f7f4';
}

class AppStore {
	translucent = $state(false);
	accent = $state<string | null>(null);
	panel = $state<PanelId>(DEFAULT_PANEL);
	query = $state('');
	accentText = $derived(this.accent ? readableOn(this.accent) : null);

	async start() {
		const state = await appState();
		this.translucent = state.translucent;
		this.accent = state.accent?.color ?? null;
		if (state.page) this.open(state.page);
		onAccentChanged(({ color }) => (this.accent = color));
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
