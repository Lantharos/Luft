import { SvelteMap } from 'svelte/reactivity';
import { previewEntries } from '$lib/file-manager/preview';
import { isDesktopRuntime } from '$lib/runtime';
import { settings } from '$lib/state/settings.svelte';
import type { FileEntry } from '$lib/types';
import * as api from '../api';
import { OnScreen } from './tracker';
import type { CountBatch } from '../types';

const REMEMBERED = 2000;

interface Counted {
	modified: number | null;
	hidden: boolean;
	count: number | null;
}

class FolderCounts {
	#counted = new SvelteMap<string, Counted>();
	#asked = new Map<string, Omit<Counted, 'count'>>();
	#screen = new OnScreen(() => this.#flush());
	#requested = '';

	receive = (batch: CountBatch) => {
		for (const { path, count } of batch.items) {
			const asked = this.#asked.get(path);
			if (asked) this.#counted.set(path, { ...asked, count });
		}
	};

	count(entry: FileEntry) {
		if (!isDesktopRuntime()) return previewEntries(entry.path).length;
		this.#screen.watch(entry);
		const counted = this.#counted.get(entry.path);
		return counted && this.#current(entry, counted) ? counted.count : null;
	}

	#current(entry: FileEntry, counted: Omit<Counted, 'count'>) {
		return counted.modified === entry.modified && counted.hidden === settings.value.showHidden;
	}

	#flush() {
		const hidden = settings.value.showHidden;
		const wanted = [...this.#screen.entries.values()].filter((entry) => {
			const counted = this.#counted.get(entry.path);
			return !counted || !this.#current(entry, counted);
		});
		const request = `${hidden}\n${wanted.map((entry) => entry.path).join('\n')}`;
		if (request === this.#requested) return;
		this.#requested = request;
		this.#asked = new Map(wanted.map((entry) => [entry.path, { modified: entry.modified, hidden }]));
		this.#forgetHidden();
		void api.countItems([...this.#asked.keys()], hidden);
	}

	#forgetHidden() {
		if (this.#counted.size <= REMEMBERED) return;
		for (const path of this.#counted.keys()) if (!this.#screen.entries.has(path)) this.#counted.delete(path);
	}
}

export const folderCounts = new FolderCounts();
