import * as api from '#lib/api.js';
import { isDesktopRuntime } from '#lib/runtime.js';
import type { ListColumn, Settings } from '#lib/types/index.js';

export const DEFAULT_LIST_COLUMNS: ListColumn[] = [
	{ id: 'date', width: 150, visible: true },
	{ id: 'size', width: 84, visible: true },
	{ id: 'kind', width: 132, visible: true }
];

const DEFAULT_SETTINGS: Settings = {
	folderViewModes: {},
	sortBy: 'name',
	sortAsc: true,
	showHidden: false,
	pinnedFolders: [],
	gridSize: 88,
	detailsOpen: false,
	listColumns: DEFAULT_LIST_COLUMNS,
	groupBy: 'none',
	hiddenPlaces: [],
	networkPlaces: [],
	recentServers: []
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

export function setPlaceHidden(path: string, hidden: boolean) {
	settings.update((current) => ({
		...current,
		hiddenPlaces: hidden ? [...current.hiddenPlaces, path] : current.hiddenPlaces.filter((place) => place !== path)
	}));
}
