import { selection } from '#lib/selection/selection.svelte.js';
import { pagePoint, type Origin, type Target } from './drawing';
import type { LiveInk } from '../live';
import type { Viewport } from '../viewport.svelte';

type Sample = Pick<PointerEvent, 'clientX' | 'clientY'>;

/** Drawing a loop around ink to pick it up. */
export class Lassoing {
	private readonly points: [number, number][] = [];

	constructor(
		private readonly viewport: Viewport,
		private readonly origin: Origin,
		private readonly target: Target,
		private readonly live: LiveInk,
		first: PointerEvent
	) {
		selection.clear();
		const [left, top] = viewport.toView(target.page.left, target.page.top);
		live.begin({ zoom: viewport.zoom, left, top, width: target.page.width, height: target.page.height }, '#3d7bd9', 'pen');
		this.move([first]);
	}

	move(samples: Sample[]) {
		for (const sample of samples) this.points.push(pagePoint(this.viewport, this.origin, this.target.page, sample));
		this.live.outline(this.points, 1.5 / this.viewport.zoom);
	}

	end() {
		this.live.end();
		if (this.points.length > 2) selection.pick(this.target.id, this.target.document, this.points, !!this.target.pdf);
	}

	cancel() {
		this.live.end();
	}
}
