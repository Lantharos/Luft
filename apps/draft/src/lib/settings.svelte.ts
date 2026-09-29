import type { Backend } from '$lib/bridge/types';
import { debounce } from '$lib/utils/debounce';

export interface Settings {
	wrap: boolean;
	fontSize: number;
	sidebar: boolean;
	preview: boolean;
	tabs: boolean;
	tabWidth: number;
}

const DEFAULTS: Settings = { wrap: false, fontSize: 14, sidebar: true, preview: false, tabs: true, tabWidth: 4 };
const SAVE_DELAY_MS = 400;
export const FONT_SIZES = { min: 10, max: 28 };

export class SettingsStore {
	value = $state<Settings>({ ...DEFAULTS });
	#backend: Backend | null = null;
	#save = debounce(() => void this.save(), SAVE_DELAY_MS);

	async load(backend: Backend) {
		this.#backend = backend;
		const stored = await backend.readStore<Partial<Settings>>('settings');
		this.value = { ...DEFAULTS, ...stored };
	}

	update(changes: Partial<Settings>) {
		Object.assign(this.value, changes);
		this.#save();
	}

	async save() {
		this.#save.cancel();
		await this.#backend?.writeStore('settings', $state.snapshot(this.value));
	}
}
