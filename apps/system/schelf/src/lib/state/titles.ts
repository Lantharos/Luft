import { t } from '@luft/i18n';
import type { Collection } from '#lib/bindings.js';
import { categoryTitle } from '#lib/catalog/categories.js';
import { publisherPageTitle } from '#lib/developer/pages.js';
import { developer } from '#lib/developer/state/developer.svelte.js';
import type { Route } from './navigation.svelte';

const COLLECTIONS: Record<Collection, string> = {
	popular: 'title-popular',
	updated: 'title-updated'
};

export const collectionTitle = (collection: Collection) => t(COLLECTIONS[collection]);

export function title(route: Route) {
	switch (route.page) {
		case 'discover':
			return t('title-discover');
		case 'installed':
			return t('title-installed');
		case 'updates':
			return t('title-updates');
		case 'extensions':
			return t('title-extensions');
		case 'category':
			return categoryTitle(route.category);
		case 'collection':
			return collectionTitle(route.collection);
		case 'search':
			return t('title-search', { query: route.query });
		case 'app':
			return '';
		case 'sources':
			return t('title-sources');
		case 'project':
			return developer.projectName(route.id);
		case 'release':
			return t('title-release', { project: developer.projectName(route.id), version: route.version });
		case 'publisher':
			return publisherPageTitle(route.section);
	}
}
