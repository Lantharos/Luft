import { onDestroy } from 'svelte';
import { commands, events } from '#lib/bindings.js';
import type { SettingChange, Value } from '#lib/bindings.js';

export const KESTREL_SCHEMA = 'com.lantharos.kestrel';

type Values = Record<string, Value>;

const groups = new Set<SettingsGroup<Values>>();
let unlisten: (() => void) | null = null;

function dispatch(change: SettingChange) {
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
		unlisten ??= events.settingsChanged(dispatch);
		void this.load();
	}

	private get location() {
		return this.path ? { schema: this.schema, path: this.path } : { schema: this.schema };
	}

	async load() {
		await commands.settingsWatch(this.location);
		this.values = (await commands.settingsRead({ ...this.location, keys: this.keys })) as T;
		this.loaded = true;
	}

	receive(change: SettingChange) {
		if (change.schema !== this.schema || (change.path ?? null) !== this.path) return;
		if (!this.keys.includes(change.key as keyof T & string)) return;
		(this.values as Values)[change.key] = change.value;
	}

	async set<K extends keyof T & string>(key: K, value: T[K]) {
		const previous = this.values[key];
		this.values[key] = value;
		try {
			await commands.settingsWrite({ ...this.location, key, value });
		} catch (error) {
			this.values[key] = previous;
			throw error;
		}
	}

	async reset<K extends keyof T & string>(key: K) {
		await commands.settingsReset({ ...this.location, key });
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
