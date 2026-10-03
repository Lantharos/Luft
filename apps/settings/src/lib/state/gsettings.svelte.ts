import { onDestroy } from 'svelte';
import { invoke, listen } from '#lib/bridge.js';

type Values = Record<string, unknown>;

interface Change {
	schema: string;
	path: string | null;
	key: string;
	value: unknown;
}

const groups = new Set<SettingsGroup<Values>>();
let unlisten: (() => void) | null = null;

function dispatch(change: Change) {
	for (const group of groups) group.receive(change);
}

export class SettingsGroup<T extends Values> {
	values = $state({} as T);
	loaded = $state(false);

	constructor(
		readonly schema: string,
		readonly keys: (keyof T & string)[],
		readonly path: string | null = null
	) {
		groups.add(this as unknown as SettingsGroup<Values>);
		unlisten ??= listen<Change>('settings.changed', dispatch);
		void this.load();
	}

	private get location() {
		return this.path ? { schema: this.schema, path: this.path } : { schema: this.schema };
	}

	async load() {
		this.values = (await invoke<T>('settings_read', { ...this.location, keys: this.keys })) as T;
		this.loaded = true;
		await invoke('settings_watch', this.location);
	}

	receive(change: Change) {
		if (change.schema !== this.schema || (change.path ?? null) !== this.path) return;
		if (!this.keys.includes(change.key as keyof T & string)) return;
		(this.values as Values)[change.key] = change.value;
	}

	async set<K extends keyof T & string>(key: K, value: T[K]) {
		const previous = this.values[key];
		this.values[key] = value;
		try {
			await invoke('settings_write', { ...this.location, key, value });
		} catch (error) {
			this.values[key] = previous;
			throw error;
		}
	}

	async reset<K extends keyof T & string>(key: K) {
		await invoke('settings_reset', { ...this.location, key });
		await this.load();
	}

	destroy() {
		groups.delete(this as unknown as SettingsGroup<Values>);
	}
}

export function useSettings<T extends Values>(schema: string, keys: (keyof T & string)[], path: string | null = null) {
	const group = new SettingsGroup<T>(schema, keys, path);
	onDestroy(() => group.destroy());
	return group;
}

export const schemaInstalled = (schema: string) => invoke<boolean>('settings_installed', { schema });
