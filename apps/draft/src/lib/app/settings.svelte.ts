import { readStore, writeStore } from '#lib/bridge/index.js';
import { debounce } from '#lib/utils/debounce.js';

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
	#save = debounce(() => void this.save(), SAVE_DELAY_MS);

	async load() {
		const stored = await readStore<Partial<Settings>>('settings');
		this.value = { ...DEFAULTS, ...stored };
	}

	update(changes: Partial<Settings>) {
		Object.assign(this.value, changes);
		this.#save();
	}

	async save() {
		this.#save.cancel();
		await writeStore('settings', $state.snapshot(this.value));
	}
}
