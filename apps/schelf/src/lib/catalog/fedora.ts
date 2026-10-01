import type { Backend, FedoraSummary } from '$lib/bridge/types';
import type { AppDetails, CatalogApp } from './types';
import type { Category } from './categories';

export function toApp(app: FedoraSummary): CatalogApp {
	return {
		key: `fedora:${app.id}`,
		origin: 'fedora',
		id: app.id,
		name: app.name,
		summary: app.summary,
		icon: app.icon,
		developer: null,
		package: app.package
	};
}

export const flathubId = (fedoraId: string) => fedoraId.replace(/\.desktop$/, '');

export function inCategory(apps: FedoraSummary[], category: Category) {
	return apps.filter((app) => app.categories.some((name) => category.desktop.includes(name))).map(toApp);
}

export function featured(apps: FedoraSummary[], count: number) {
	return apps
		.filter((app) => app.screenshots > 0 && app.icon)
		.sort((a, b) => b.screenshots - a.screenshots || a.name.localeCompare(b.name))
		.slice(0, count)
		.map(toApp);
}

function score(app: FedoraSummary, needle: string) {
	const name = app.name.toLowerCase();
	if (name === needle) return 0;
	if (name.startsWith(needle)) return 1;
	if (name.includes(needle)) return 2;
	if (app.keywords.some((keyword) => keyword.toLowerCase().includes(needle))) return 3;
	if (app.package.toLowerCase().includes(needle)) return 4;
	if (app.summary.toLowerCase().includes(needle)) return 5;
	return null;
}

export function search(apps: FedoraSummary[], query: string): CatalogApp[] {
	const needle = query.trim().toLowerCase();
	if (!needle) return [];
	return apps
		.map((app) => ({ app, rank: score(app, needle) }))
		.filter((entry): entry is { app: FedoraSummary; rank: number } => entry.rank !== null)
		.sort((a, b) => a.rank - b.rank || a.app.name.localeCompare(b.app.name))
		.map((entry) => toApp(entry.app));
}

export async function details(backend: Backend, id: string): Promise<AppDetails> {
	const app = await backend.fedoraApp(id);
	return {
		origin: 'fedora',
		id,
		name: app.name,
		summary: app.summary,
		description: app.description || (app.details?.description ? `<p>${escape(app.details.description)}</p>` : ''),
		icon: app.icon,
		developer: app.developer,
		license: app.license ?? app.details?.license ?? null,
		homepage: app.homepage ?? app.details?.url ?? null,
		screenshots: app.screenshots,
		release: app.details ? { version: app.details.package.version, date: null, notes: '' } : null,
		downloadSize: app.details?.downloadSize || null,
		installedSize: app.details?.size || null,
		verified: null,
		package: app.package,
		permissions: null
	};
}

function escape(text: string) {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
