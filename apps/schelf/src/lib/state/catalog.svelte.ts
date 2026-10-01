import type { FedoraSummary } from '$lib/bridge/types';
import { backend } from './backend';

class Catalog {
	fedora = $state.raw<FedoraSummary[]>([]);
	private loading: Promise<FedoraSummary[]> | null = null;

	loadFedora() {
		this.loading ??= backend()
			.fedoraApps()
			.then((apps) => (this.fedora = apps))
			.catch(() => []);
		return this.loading;
	}

	fedoraFor(id: string) {
		return this.fedora.find((app) => app.id === id || app.id === `${id}.desktop`) ?? null;
	}
}

export const catalog = new Catalog();
