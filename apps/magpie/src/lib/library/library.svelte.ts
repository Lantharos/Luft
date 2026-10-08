import type { Folder, Item, Listing, Location } from '#lib/bridge/api.js';
import * as api from '#lib/bridge/api.js';
import { groupOf, parent, type Group } from './kinds';

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

export type Direction = -1 | 0 | 1;

function sorted<T extends { name: string }>(entries: T[]) {
	return entries.toSorted((a, b) => collator.compare(a.name, b.name));
}

class Library {
	places = $state.raw<Location[]>([]);
	folder = $state<string | null>(null);
	items = $state.raw<Item[]>([]);
	folders = $state.raw<Folder[]>([]);
	current = $state.raw<Item | null>(null);
	direction = $state<Direction>(0);
	unopenable = $state<string | null>(null);

	group = $derived<Group | null>(this.current && groupOf(this.current.kind));
	siblings = $derived(this.group ? this.items.filter((item) => groupOf(item.kind) === this.group) : []);
	index = $derived(this.current ? this.siblings.findIndex((item) => item.path === this.current!.path) : -1);
	hasPrevious = $derived(this.index > 0);
	hasNext = $derived(this.index >= 0 && this.index < this.siblings.length - 1);

	async open(path: string) {
		const listing = await api.openFolder(parent(path)).catch(() => null);
		const item = listing?.items.find((candidate) => candidate.path === path);
		if (listing && item) return this.#show(listing, item);
		const inside = await api.openFolder(path).catch(() => null);
		const first = inside && sorted(inside.items)[0];
		if (inside && first) return this.#show(inside, first);
		this.unopenable = path;
	}

	async browse(folder: string) {
		const listing = await api.openFolder(folder).catch(() => null);
		if (!listing) return;
		this.#list(listing);
		this.current = null;
	}

	close() {
		this.current = null;
	}

	receive = (listing: Listing) => {
		if (listing.folder !== this.folder) return;
		const previousIndex = this.index;
		const previousGroup = this.group;
		this.#list(listing);
		const kept = this.current && this.items.find((item) => item.path === this.current!.path);
		if (kept) return void (this.current = kept);
		const siblings = this.items.filter((item) => previousGroup && groupOf(item.kind) === previousGroup);
		this.current = siblings[Math.min(previousIndex, siblings.length - 1)] ?? null;
	};

	select(item: Item, direction: Direction = 0) {
		if (item.path === this.current?.path) return;
		this.direction = direction;
		this.current = item;
	}

	step(delta: 1 | -1, wrap = false) {
		const count = this.siblings.length;
		if (!count) return false;
		const target = wrap ? (this.index + delta + count) % count : this.index + delta;
		const item = this.siblings[target];
		if (!item) return false;
		this.select(item, delta);
		return true;
	}

	#show(listing: Listing, item: Item) {
		this.#list(listing);
		this.direction = 0;
		this.current = item;
	}

	#list(listing: Listing) {
		this.unopenable = null;
		this.folder = listing.folder;
		this.items = sorted(listing.items);
		this.folders = sorted(listing.folders);
	}
}

export const library = new Library();
