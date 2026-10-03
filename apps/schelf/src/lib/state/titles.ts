import { category } from '#lib/catalog/categories.js';
import type { Collection } from '#lib/catalog/flathub.js';
import type { Route } from './navigation.svelte';

const COLLECTIONS: Record<Collection, string> = {
	popular: 'Popular',
	trending: 'Trending',
	'recently-updated': 'New and updated',
	'recently-added': 'Recently added'
};

export function title(route: Route) {
	switch (route.page) {
		case 'discover':
			return 'Discover';
		case 'installed':
			return 'Installed';
		case 'updates':
			return 'Updates';
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
	}
}
