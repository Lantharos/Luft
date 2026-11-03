import { commands, events, type InstalledFromStore, type StoreState } from '#lib/bindings.js';
import { SLOW } from '#lib/bridge/index.js';

const CATALOG_EVERY_MS = 6 * 60 * 60 * 1000;
const REVOCATIONS_EVERY_MS = 60 * 60 * 1000;

class Catalog {
	version = $state(0);
	state = $state<StoreState | null>(null);

	async start() {
		events.schelfLibrary(async () => (this.state = await commands.storeState()));
		this.state = await commands.storeState();
		void this.refresh();
		setInterval(() => void this.refresh(), CATALOG_EVERY_MS);
		setInterval(() => void this.checkRevocations(), REVOCATIONS_EVERY_MS);
	}

	async refresh() {
		this.state = await commands.storeRefresh(SLOW).catch(() => this.state);
		this.version += 1;
	}

	async checkRevocations() {
		this.state = await commands.storeRevocations(SLOW).catch(() => this.state);
	}

	installed(id: string): InstalledFromStore | null {
		return this.state?.installed.find((app) => app.id === id) ?? null;
	}
}

export const catalog = new Catalog();
