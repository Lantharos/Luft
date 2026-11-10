import { carry } from '#lib/drag/carry.svelte.js';
import { textSelection } from '#lib/pdf/selection.svelte.js';

type Sample = Pick<PointerEvent, 'clientX' | 'clientY'>;

const SLOP = 6;

export class TextCarrying {
	private carrying = false;

	constructor(
		private readonly element: HTMLElement,
		private readonly text: string,
		private readonly from: Sample
	) {}

	move(sample: Sample) {
		if (!this.carrying && Math.hypot(sample.clientX - this.from.clientX, sample.clientY - this.from.clientY) < SLOP) return;
		if (!this.carrying) carry.start(this.element, { kind: 'text', text: this.text }, null);
		this.carrying = true;
		carry.move(sample.clientX, sample.clientY);
	}

	end() {
		if (this.carrying && carry.end(true)) textSelection.clear();
	}

	cancel() {
		if (this.carrying) carry.end(false);
	}
}
