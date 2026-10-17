import type { FedoraSummary } from '#lib/bridge/types.js';
import type { Category } from '#lib/catalog/categories.js';
import { backend } from '#lib/state/backend.js';
import * as catalog from './catalog';

class Fedora {
	available = $state(false);
	apps = $state.raw<FedoraSummary[]>([]);
	private loading: Promise<void> | null = null;

	load() {
		if (!this.available) return Promise.resolve();
		this.loading ??= backend()
			.fedoraApps()
			.then((apps) => void (this.apps = apps))
			.catch(() => {});
		return this.loading;
	}

	find(id: string) {
		return this.apps.find((app) => app.id === id || app.id === `${id}.desktop`) ?? null;
	}

	featured(count: number) {
		return this.apps.length ? catalog.featured(this.apps, count) : null;
	}

	inCategory(category: Category) {
		return catalog.inCategory(this.apps, category);
	}

	search(query: string) {
		return this.apps.length ? catalog.search(this.apps, query) : null;
	}

	details(id: string) {
		return catalog.details(backend(), id);
	}
}

export const fedora = new Fedora();
