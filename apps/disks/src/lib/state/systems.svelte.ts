import { commands } from '#lib/bindings.js';
import type { Drive, OtherSystem } from '#lib/bindings.js';
import { WAIT } from '#lib/bridge/index.js';

function layoutKey(drives: Drive[]) {
	return drives
		.flatMap((drive) => drive.segments.map((segment) => (segment.kind === 'volume' ? `${segment.block}:${segment.size}` : '')))
		.join(',');
}

class Systems {
	list = $state.raw<OtherSystem[]>([]);

	#layout = '';
	#loading: Promise<void> | null = null;
	#stale = false;

	on(drive: Drive) {
		return this.list.filter((system) => system.drive === drive.id);
	}

	find(id: string) {
		return this.list.find((system) => system.id === id) ?? null;
	}

	follow(drives: Drive[]) {
		const layout = layoutKey(drives);
		if (layout === this.#layout) return;
		this.#layout = layout;
		void this.load();
	}

	load() {
		if (this.#loading) {
			this.#stale = true;
			return this.#loading;
		}
		this.#loading = this.#fetch().finally(() => {
			this.#loading = null;
		});
		return this.#loading;
	}

	async #fetch() {
		do {
			this.#stale = false;
			this.list = await commands.disksSystems(WAIT).catch(() => []);
		} while (this.#stale);
	}
}

export const systems = new Systems();
