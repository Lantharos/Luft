import { commands, events } from '#lib/bindings.js';
import type { Activity, UpdatesOverview } from '#lib/bindings.js';

const IDLE: Activity = { running: null, target: null, progress: null, error: null };

class UpdatesStore {
	overview = $state.raw<UpdatesOverview | null>(null);
	activity = $state.raw<Activity>(IDLE);

	async start() {
		events.updatesActivity((next) => (this.activity = next));
		events.updatesOverview((next) => (this.overview = next));
		const current = await commands.updatesStatus();
		this.overview = current.overview;
		this.activity = current.activity;
	}
}

export const updates = new UpdatesStore();
