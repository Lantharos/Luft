import type { AppUsage, Backend } from '#lib/backend/types.js';

class UsageStore {
	apps = $state.raw<AppUsage[]>([]);
	ready = $state(false);
	expanded = $state.raw<string[]>([]);

	start(backend: Backend) {
		backend.onApps((apps) => {
			this.apps = apps;
			this.ready = true;
		});
	}

	toggle(key: string) {
		this.expanded = this.expanded.includes(key) ? this.expanded.filter((other) => other !== key) : [...this.expanded, key];
	}
}

export const usage = new UsageStore();
