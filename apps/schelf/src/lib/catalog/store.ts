import { commands, type CatalogApp, type Collection, type StoreDetails } from '#lib/bindings.js';
import type { CategoryId } from './categories';
import type { AppDetails } from './types';

export const collection = (name: Collection) => commands.storeCollection({ collection: name });

export const category = (id: CategoryId) => commands.storeCategory({ category: id });

export const extensions = () => commands.storeExtensions();

export const search = (query: string) => commands.storeSearch({ query });

export const entry = (id: string) => commands.storeEntry({ id });

const timestamp = (published: string | null) => (published ? Math.floor(Date.parse(published) / 1000) : null);

function fromStore(store: StoreDetails): AppDetails {
	return {
		id: store.id,
		origin: 'schelf',
		name: store.name,
		summary: store.summary,
		description: store.description,
		icon: store.icon,
		developer: store.developer,
		license: store.license,
		homepage: store.homepage,
		screenshots: store.screenshots,
		release: store.version ? { version: store.version, date: timestamp(store.published), notes: store.notes } : null,
		downloadSize: store.size,
		installedSize: null,
		verified: store.verified ? 'Verified by schelf.store' : null,
		permissions: store.access,
		store
	};
}

const escaped = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const paragraphs = (text: string) =>
	text
		.split(/\n\s*\n/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean)
		.map((paragraph) => `<p>${escaped(paragraph)}</p>`)
		.join('');

export async function fedoraDetails(app: CatalogApp): Promise<AppDetails> {
	const fedora = await commands.fedoraDetails({ package: app.package ?? app.id });
	return {
		id: app.id,
		origin: 'fedora',
		name: app.name,
		summary: app.summary,
		description: fedora ? paragraphs(fedora.description) : '',
		icon: app.icon,
		developer: app.developer,
		license: fedora?.license ?? null,
		homepage: fedora?.homepage ?? null,
		screenshots: [],
		release: fedora ? { version: fedora.version, date: null, notes: '' } : null,
		downloadSize: fedora?.download ?? null,
		installedSize: fedora?.size ?? null,
		verified: null,
		permissions: null,
		store: null
	};
}

export const storeDetails = (id: string) => commands.storeDetails({ id }).then(fromStore);
