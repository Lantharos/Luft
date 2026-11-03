import { commands, events } from '#lib/bindings.js';
import type { Library, Wallpaper } from '#lib/bindings.js';

export interface WallpaperGroup {
	id: string;
	name: string;
	wallpapers: Wallpaper[];
}

const SYSTEM_GROUP: Omit<WallpaperGroup, 'wallpapers'> = { id: 'system', name: 'Luft' };

class WallpaperLibrary {
	#found = $state.raw<Library | null>(null);
	#listening = false;

	#hasOwn = $derived(!!this.#found && (this.#found.wallpapers.length > 0 || this.#found.groups.length > 0));

	get loaded() {
		return this.#found !== null;
	}

	get loose(): Wallpaper[] {
		if (!this.#found) return [];
		return this.#hasOwn ? this.#found.wallpapers : this.#found.system;
	}

	get groups(): WallpaperGroup[] {
		if (!this.#found) return [];
		const own = this.#found.groups.map((group) => ({ id: `folder:${group.name}`, ...group }));
		return this.#hasOwn && this.#found.system.length ? [...own, { ...SYSTEM_GROUP, wallpapers: this.#found.system }] : own;
	}

	get empty() {
		return this.loaded && this.loose.length === 0 && this.groups.length === 0;
	}

	includes(path: string) {
		return this.loose.some((wallpaper) => wallpaper.path === path) || this.groups.some((group) => group.wallpapers.some((wallpaper) => wallpaper.path === path));
	}

	group(id: string) {
		return this.groups.find((group) => group.id === id);
	}

	load() {
		if (this.#listening) return;
		this.#listening = true;
		events.appearanceWallpapers((found) => (this.#found = found));
		void commands.appearanceWallpapers().then((found) => (this.#found = found));
	}
}

export const wallpaperLibrary = new WallpaperLibrary();
