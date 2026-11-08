import { events } from '@lantharos/sabine';

export const BARREL = 1;
export const SECOND_BARREL = 2;
const PALM_GRACE = 450;

/** The pen as Sabine reports it, including what Chromium's pointer events leave out. */
class Pen {
	near = $state(false);
	tool: 'pen' | 'eraser' = $state('pen');
	buttons = $state(0);
	private lastSeen = 0;

	start() {
		return events.pen((state) => {
			this.near = state.near || state.contact;
			this.tool = state.tool;
			this.buttons = state.buttons;
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
