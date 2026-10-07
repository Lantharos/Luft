import { onActivity, onOverview, status, type Activity, type Overview } from '#lib/panels/updates/api.js';

const IDLE: Activity = { running: null, target: null, elsewhere: null, progress: null, error: null };

class UpdatesStore {
	overview = $state.raw<Overview | null>(null);
	activity = $state.raw<Activity>(IDLE);

	async start() {
		onActivity((next) => (this.activity = next));
		onOverview((next) => (this.overview = next));
		const current = await status();
		this.overview = current.overview;
		this.activity = current.activity;
	}
}

export const updates = new UpdatesStore();
