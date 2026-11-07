import { SvelteMap } from 'svelte/reactivity';
import { commands } from '#lib/bindings.js';
import type { FileEntry, FolderLook, UserDirs } from '#lib/bindings.js';
import { OnScreen } from '#lib/features/onscreen/tracker.js';
import { mainPlaces } from '#lib/file-manager/places/places.svelte.js';
import { iconNamed, tint } from './catalogue';

const REMEMBERED = 4000;

function same(a: FolderLook | null, b: FolderLook | null) {
	return a?.icon === b?.icon && a?.color === b?.color;
}

class FolderLooks {
	#known = new SvelteMap<string, FolderLook | null>();
	#checked = new Set<string>();
	#kept = new Set<string>();
	#defaults = new Map<string, string>();
	#screen = new OnScreen(() => this.#flush());

	useFolders(dirs: UserDirs | null) {
		this.#defaults = new Map(mainPlaces(dirs).map((place) => [place.path, place.icon]));
	}

	of(entry: FileEntry) {
		if (!entry.isDir) return {};
		this.#screen.watch(entry);
		return this.art(entry.path);
	}

	art(path: string) {
		const look = this.#known.get(path);
		return { icon: iconNamed(look?.icon ?? this.#defaults.get(path)), tint: tint(look?.color) };
	}

	look(path: string) {
		return this.#known.get(path) ?? null;
	}

	defaultIcon(path: string) {
		return this.#defaults.get(path) ?? 'folder';
	}

	keep = async (paths: string[]) => {
		this.#kept = new Set(paths);
		await this.#load(paths);
	};

	refresh() {
		this.#checked.clear();
		this.#screen.schedule();
	}

	set = async (paths: string[], look: FolderLook | null) => {
		await commands.setFolderLook({ paths, look });
		for (const path of paths) this.#store(path, look);
	};

	async #load(paths: string[]) {
		const found = await commands.folderLooks({ paths });
		for (const path of paths) this.#store(path, found[path] ?? null);
	}

	#store(path: string, look: FolderLook | null) {
		if (!this.#known.has(path) || !same(this.#known.get(path)!, look)) this.#known.set(path, look);
	}

	#flush() {
		const wanted = [...this.#screen.entries.keys()].filter((path) => !this.#checked.has(path));
		if (wanted.length === 0) return;
		for (const path of wanted) this.#checked.add(path);
		this.#forgetHidden();
		void this.#load(wanted);
	}

	#forgetHidden() {
		if (this.#known.size <= REMEMBERED) return;
		for (const path of this.#known.keys()) {
			if (!this.#screen.entries.has(path) && !this.#kept.has(path)) {
				this.#known.delete(path);
				this.#checked.delete(path);
			}
		}
	}
}

export const folderLooks = new FolderLooks();
