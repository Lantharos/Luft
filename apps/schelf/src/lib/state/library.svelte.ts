import type { InstalledApp, Updates } from '#lib/bridge/types.js';
import { backend } from './backend';

class Library {
	installed = $state<InstalledApp[]>([]);
	loaded = $state(false);
	updates = $state<Updates | null>(null);
	checking = $state(false);
	error = $state<string | null>(null);

	async start() {
		backend().onLibraryChanged(({ keys, action, succeeded }) => {
			if (succeeded && action !== 'install') this.forget(keys);
			void this.refresh();
		});
		await this.refresh();
		void this.check();
	}

	async refresh() {
		this.installed = await backend().installed();
		this.loaded = true;
	}

	async check() {
		if (this.checking) return;
		this.checking = true;
		try {
			this.updates = await backend().checkUpdates();
			this.error = this.updates.error;
		} catch (reason) {
			this.error = String(reason);
		} finally {
			this.checking = false;
		}
	}

	private forget(keys: string[]) {
		if (this.updates) this.updates = { ...this.updates, apps: this.updates.apps.filter((update) => !keys.includes(update.key)) };
	}

	byKey(key: string) {
		return this.installed.find((app) => app.key === key) ?? null;
	}

	flatpak(id: string) {
		return this.installed.find((app) => app.source === 'flatpak' && app.id === id) ?? null;
	}

	package(name: string) {
		return this.installed.find((app) => app.source === 'package' && app.package === name) ?? null;
	}

	update(key: string) {
		return this.updates?.apps.find((update) => update.key === key) ?? null;
	}

	get updateCount() {
		return this.updates?.apps.length ?? 0;
	}
}

export const library = new Library();
