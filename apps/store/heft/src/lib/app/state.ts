import { commands, type Value } from '#lib/bindings.js';

/** What Heft remembers between runs that isn't a setting: pens, open notebooks, where each was scrolled. */
class AppState {
	private stored: Record<string, unknown> = {};

	async load() {
		this.stored = ((await commands.settingsLoad({ name: 'state' })) as Record<string, unknown> | null) ?? {};
	}

	get<T>(key: string): T | undefined {
		return this.stored[key] as T | undefined;
	}

	save(changes: Record<string, unknown>) {
		Object.assign(this.stored, changes);
		return commands.settingsSave({ name: 'state', value: this.stored as Value });
	}
}

export const appState = new AppState();
