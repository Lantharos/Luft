import type { Collection } from '#lib/bindings.js';
import { category } from '#lib/catalog/categories.js';
import { PUBLISHER_PAGES } from '#lib/developer/pages.js';
import { developer } from '#lib/developer/state/developer.svelte.js';
import type { Route } from './navigation.svelte';

export const COLLECTIONS: Record<Collection, string> = {
	popular: 'Popular',
	updated: 'New and updated'
};

export function title(route: Route) {
	switch (route.page) {
		case 'discover':
			return 'Discover';
		case 'installed':
			return 'Installed';
		case 'updates':
			return 'Updates';
		case 'extensions':
			return 'Extensions';
		case 'category':
			return category(route.category).title;
		case 'collection':
			return COLLECTIONS[route.collection];
		case 'search':
			return `Results for “${route.query}”`;
		case 'app':
			return '';
		case 'file':
			return 'Install from a file';
		case 'sources':
			return 'Software sources';
		case 'project':
			return developer.projectName(route.id);
		case 'release':
			return `${developer.projectName(route.id)} ${route.version}`;
		case 'publisher':
			return PUBLISHER_PAGES[route.section];
	}
}
