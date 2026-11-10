import { events } from '@lantharos/sabine';

const PALM_GRACE = 450;

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

	get palmLikely(): boolean {
		return this.near || performance.now() - this.lastSeen < PALM_GRACE;
	}
}

export const pen = new Pen();
