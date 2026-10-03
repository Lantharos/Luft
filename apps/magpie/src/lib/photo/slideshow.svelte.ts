import { chrome } from '#lib/app/chrome.svelte.js';
import { library } from '#lib/library/library.svelte.js';

const INTERVAL_MS = 5000;

class Slideshow {
	running = $state(false);
	#timer: ReturnType<typeof setTimeout> | undefined;
	#sidebar = true;

	start() {
		if (this.running) return;
		this.running = true;
		this.#sidebar = chrome.sidebar;
		chrome.sidebar = false;
		chrome.setFullscreen(true);
		this.#schedule();
	}

	stop() {
		if (!this.running) return;
		this.running = false;
		clearTimeout(this.#timer);
		chrome.sidebar = this.#sidebar;
		chrome.setFullscreen(false);
	}

	#schedule() {
		clearTimeout(this.#timer);
		this.#timer = setTimeout(() => {
			if (!this.running) return;
			const photos = library.siblings.filter((item) => item.kind === 'image');
			const at = photos.findIndex((item) => item.path === library.current?.path);
			const next = photos[(at + 1) % photos.length];
			if (next) library.select(next, 1);
			this.#schedule();
		}, INTERVAL_MS);
	}
}

export const slideshow = new Slideshow();
