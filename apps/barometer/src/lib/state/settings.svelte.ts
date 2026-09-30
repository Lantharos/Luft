import type { Backend } from '$lib/backend/types';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type SortDirection = 'ascending' | 'descending';

export interface Sort {
	column: string;
	direction: SortDirection;
}

export interface Settings {
	interval: number;
	history: number;
	networkBits: boolean;
	temperature: TemperatureUnit;
	showVirtual: boolean;
	normalizeCpu: boolean;
	showCores: boolean;
	animateGraphs: boolean;
	processColumns: string[];
	appColumns: string[];
	processSort: Sort;
	appSort: Sort;
}

const DEFAULTS: Settings = {
	interval: 1000,
	history: 60,
	networkBits: false,
	temperature: 'celsius',
	showVirtual: false,
	normalizeCpu: false,
	showCores: true,
	animateGraphs: false,
	processColumns: ['user', 'cpu', 'memory', 'gpu', 'pid'],
	appColumns: ['cpu', 'memory', 'read', 'write', 'gpu', 'vram'],
	processSort: { column: 'cpu', direction: 'descending' },
	appSort: { column: 'cpu', direction: 'descending' }
};

class SettingsStore {
	value = $state<Settings>(DEFAULTS);
	#backend: Backend | null = null;
	#saving = false;
	#dirty = false;

	load(backend: Backend, saved: Record<string, unknown> | null) {
		this.#backend = backend;
		this.value = { ...DEFAULTS, ...(saved as Partial<Settings> | null) };
	}

	update(change: Partial<Settings>) {
		this.value = { ...this.value, ...change };
		void this.#persist();
	}

	async #persist() {
		if (!this.#backend) return;
		if (this.#saving) {
			this.#dirty = true;
			return;
		}
		this.#saving = true;
		do {
			this.#dirty = false;
			await this.#backend.saveSettings($state.snapshot(this.value)).catch((error) => console.error('Could not save settings', error));
		} while (this.#dirty);
		this.#saving = false;
	}
}

export const settings = new SettingsStore();
