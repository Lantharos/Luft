import * as api from '$lib/api';
import { isDesktopRuntime } from '$lib/runtime';
import { settings } from '$lib/state/settings.svelte';
import { previewEntries } from '../preview';
import { expandHome } from './expand';

const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

export class PathCompletion {
	candidates = $state.raw<string[]>([]);
	index = $state(-1);
	base = $state('');

	#home: () => string;
	#folders = new Map<string, Promise<string[]>>();
	#offered = '';

	constructor(home: () => string) {
		this.#home = home;
	}

	get active() {
		return this.candidates[this.index] ?? null;
	}

	complete = async (value: string, backwards: boolean) => {
		if (value === this.#offered && this.candidates.length > 1) return this.#offer(this.#step(backwards));
		const slash = value.lastIndexOf('/');
		if (slash === -1) return this.reset();
		const base = value.slice(0, slash + 1);
		const partial = value.slice(slash + 1);
		const matches = matching(await this.#list(expandHome(base, this.#home())), partial);
		this.base = base;
		this.candidates = matches.length > 1 ? matches : [];
		this.index = -1;
		if (matches.length === 0) return this.reset();
		if (matches.length === 1) return this.#finish(`${base}${matches[0]}/`);
		const prefix = commonPrefix(matches);
		if (prefix.length > partial.length) return this.#remember(`${base}${prefix}`);
		return this.#offer(backwards ? matches.length - 1 : 0);
	};

	choose = (name: string) => this.#finish(`${this.base}${name}/`);

	reset = () => {
		this.candidates = [];
		this.index = -1;
		this.#offered = '';
		return null;
	};

	forget = () => {
		this.reset();
		this.#folders.clear();
	};

	#step(backwards: boolean) {
		const count = this.candidates.length;
		if (this.index === -1) return backwards ? count - 1 : 0;
		return (this.index + (backwards ? -1 : 1) + count) % count;
	}

	#offer(index: number) {
		this.index = index;
		return this.#remember(`${this.base}${this.candidates[index]}/`);
	}

	#finish(value: string) {
		this.reset();
		return value;
	}

	#remember(value: string) {
		this.#offered = value;
		return value;
	}

	#list(folder: string) {
		let folders = this.#folders.get(folder);
		if (!folders) {
			folders = isDesktopRuntime()
				? api.listFolders(folder).catch(() => [])
				: Promise.resolve(previewEntries(folder.replace(/\/+$/, '') || '/').filter((entry) => entry.is_dir).map((entry) => entry.name));
			this.#folders.set(folder, folders);
		}
		return folders;
	}
}

function matching(names: string[], partial: string) {
	const typed = partial.toLowerCase();
	const hidden = settings.value.showHidden || partial.startsWith('.');
	return names
		.filter((name) => (hidden || !name.startsWith('.')) && name.toLowerCase().startsWith(typed))
		.sort(collator.compare);
}

function commonPrefix(names: string[]) {
	let length = names[0].length;
	for (const name of names) {
		let shared = 0;
		while (shared < length && name[shared]?.toLowerCase() === names[0][shared].toLowerCase()) shared++;
		length = shared;
	}
	return names[0].slice(0, length);
}
