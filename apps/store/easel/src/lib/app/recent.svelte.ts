import { readStore, writeStore } from './store';

export interface RecentFile {
	path: string;
	at: number;
}

const KEPT = 12;

class Recent {
	files = $state<RecentFile[]>([]);

	async load() {
		this.files = (await readStore<RecentFile[]>('recent')) ?? [];
	}

	touch(path: string) {
		this.files = [{ path, at: Date.now() }, ...this.files.filter((file) => file.path !== path)].slice(0, KEPT);
		void writeStore('recent', $state.snapshot(this.files));
	}

	forget(path: string) {
		this.files = this.files.filter((file) => file.path !== path);
		void writeStore('recent', $state.snapshot(this.files));
	}
}

export const recent = new Recent();
