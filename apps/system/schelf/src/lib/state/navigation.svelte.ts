import type { CatalogApp, Collection } from '#lib/bindings.js';
import type { CategoryId } from '#lib/catalog/categories.js';
import type { ProjectTab, PublisherPage } from '#lib/developer/pages.js';

export type AppTarget = { listing: CatalogApp } | { installed: string };

export type Route =
	| { page: 'discover' }
	| { page: 'installed' }
	| { page: 'updates' }
	| { page: 'extensions' }
	| { page: 'category'; category: CategoryId }
	| { page: 'collection'; collection: Collection }
	| { page: 'search'; query: string }
	| { page: 'app'; target: AppTarget; name: string; askFullAccess?: boolean; reviewAccess?: boolean }
	| { page: 'file'; path: string }
	| { page: 'sources' }
	| { page: 'project'; id: string; tab: ProjectTab }
	| { page: 'release'; id: string; release: string; version: string }
	| { page: 'publisher'; section: PublisherPage };

const DEVELOPER_PAGES = new Set<Route['page']>(['project', 'release', 'publisher']);

class Navigation {
	stack = $state<Route[]>([{ page: 'discover' }]);
	query = $state('');
	private shelved = $state<Route[] | null>(null);

	get route() {
		return this.stack[this.stack.length - 1];
	}

	get root() {
		return this.stack[0];
	}

	get developing() {
		return this.shelved !== null;
	}

	open(route: Route) {
		if (!DEVELOPER_PAGES.has(route.page)) this.shelved = null;
		this.stack = [route];
		if (route.page !== 'search') this.query = '';
	}

	push(route: Route) {
		this.stack = [...this.stack, route];
	}

	reopen(stack: Route[]) {
		if (stack.length) this.stack = stack;
	}

	develop(route: Route) {
		this.shelved ??= this.stack;
		this.stack = [route];
	}

	leave() {
		if (!this.shelved) return;
		this.stack = this.shelved;
		this.shelved = null;
	}

	kept = (): Route[] => (this.shelved ?? this.stack).map((route) => (route.page === 'app' ? { page: 'app', target: route.target, name: route.name } : route));

	back() {
		if (this.stack.length > 1) this.stack = this.stack.slice(0, -1);
	}

	search(query: string) {
		const trimmed = query.trim();
		if (!trimmed) {
			if (this.root.page === 'search') this.open({ page: 'discover' });
			return;
		}
		this.shelved = null;
		this.stack = [{ page: 'search', query: trimmed }];
	}
}

export const navigation = new Navigation();
