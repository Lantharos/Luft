import type { Launch } from '#lib/api/index.js';
import { composer } from '#lib/compose/composer.svelte.js';

class Opened {
	file = $state<string | null>(null);
	focused = $state(false);

	handle(launches: Launch[], initial: boolean) {
		for (const launch of launches) {
			if (launch.kind === 'mailto') composer.mailto(launch.url);
			else this.file = launch.path;
		}
		if (initial) this.focused = launches.length > 0 && launches.every((launch) => launch.kind === 'message');
	}

	close() {
		this.file = null;
		this.focused = false;
	}
}

export const opened = new Opened();
