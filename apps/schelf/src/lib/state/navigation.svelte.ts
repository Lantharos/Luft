import type { CategoryId } from '#lib/catalog/categories.js';
import type { Collection } from '#lib/catalog/flathub.js';
import type { Origin } from '#lib/catalog/types.js';

export type AppTarget = { origin: Origin; id: string } | { installed: string };

export type Route =
	| { page: 'discover' }
	| { page: 'installed' }
	| { page: 'updates' }
	| { page: 'category'; category: CategoryId }
	| { page: 'collection'; collection: Collection }
	| { page: 'search'; query: string }
	| { page: 'app'; target: AppTarget; name: string }
	| { page: 'file'; path: string };

class Navigation {
	stack = $state<Route[]>([{ page: 'discover' }]);
	query = $state('');

	get route() {
		return this.stack[this.stack.length - 1];
	}

	get root() {
		return this.stack[0];
	}

	open(route: Route) {
		this.stack = [route];
		if (route.page !== 'search') this.query = '';
	}

	push(route: Route) {
		this.stack = [...this.stack, route];
	}

	replace(route: Route) {
		this.stack = [...this.stack.slice(0, -1), route];
	}

	back() {
		if (this.stack.length > 1) this.stack = this.stack.slice(0, -1);
	}

	search(query: string) {
		const trimmed = query.trim();
		if (!trimmed) {
			if (this.root.page === 'search') this.open({ page: 'discover' });
			return;
		}
		this.stack = [{ page: 'search', query: trimmed }];
	}
}

export const navigation = new Navigation();
