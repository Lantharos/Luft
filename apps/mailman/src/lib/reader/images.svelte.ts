import { SvelteMap } from 'svelte/reactivity';
import * as api from '$lib/api';

class RemoteImages {
	loaded = new SvelteMap<string, string>();
	private requested = new Set<string>();

	request(urls: string[]) {
		const missing = urls.filter((url) => !this.requested.has(url));
		missing.forEach((url) => this.requested.add(url));
		if (missing.length) void api.remoteImages(missing);
	}

	receive = (pairs: [string, string | null][]) => {
		for (const [url, path] of pairs) {
			if (path) this.loaded.set(url, path);
			else this.requested.delete(url);
		}
	};
}

export const remoteImages = new RemoteImages();
