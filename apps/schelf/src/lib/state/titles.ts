import type { Collection } from '#lib/bindings.js';
import { category } from '#lib/catalog/categories.js';
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
			return route.name;
		case 'file':
			return 'Install from a file';
		case 'sources':
			return 'Software sources';
	}
}
