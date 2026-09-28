import * as api from '$lib/api';
import { isDesktopRuntime } from '$lib/runtime';
import type { Settings } from '$lib/types';

const DEFAULT_SETTINGS: Settings = {
	folderViewModes: {},
	sortBy: 'name',
	sortAsc: true,
	showHidden: false,
	favorites: [],
	pinnedFolders: []
};

class SettingsState {
	value = $state<Settings>(DEFAULT_SETTINGS);
	#saving = false;
	#dirty = false;

	update(change: (current: Settings) => Settings) {
		this.value = change(this.value);
		if (isDesktopRuntime()) void this.#persist();
	}

	async #persist() {
		if (this.#saving) {
			this.#dirty = true;
			return;
		}
		this.#saving = true;
		do {
			this.#dirty = false;
			await api.updateSettings($state.snapshot(this.value)).catch((error) => console.error('Could not save settings', error));
		} while (this.#dirty);
		this.#saving = false;
	}
}

export const settings = new SettingsState();
