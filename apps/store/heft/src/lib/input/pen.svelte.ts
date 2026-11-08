import { events } from '@lantharos/sabine';

const PALM_GRACE = 450;

/**
 * The pen as Sabine reports it, including what Chromium's pointer events
 * leave out. Its side buttons belong to Luft's pen settings: one held to
 * erase turns the pen into its eraser end, which Heft erases with.
 */
class Pen {
	near = $state(false);
	tool: 'pen' | 'eraser' = $state('pen');
	private lastSeen = 0;

	start() {
		return events.pen((state) => {
			this.near = state.near || state.contact;
			this.tool = state.tool;
			this.lastSeen = performance.now();
		});
	}

	seen() {
		this.lastSeen = performance.now();
	}

	/** Whether a touch now is most likely the hand holding the pen. */
	get palmLikely(): boolean {
		return this.near || performance.now() - this.lastSeen < PALM_GRACE;
	}
}

export const pen = new Pen();
