import type { Bounds, Stroke } from '#lib/ink/stroke.js';

/**
 * What can be carried from one pane to the other in split view: ink picked
 * with the lasso, with a picture of the printed page under it when it came
 * from a book, or picked book text.
 */
export type Carried =
	| { kind: 'ink'; strokes: Stroke[]; bounds: Bounds; grab: [number, number]; picture: (() => Promise<HTMLCanvasElement>) | null }
	| { kind: 'text'; text: string };

export interface CarryZone {
	element: HTMLElement;
	take(item: Carried, clientX: number, clientY: number): void;
}

class Carry {
	item: Carried | null = $state.raw(null);
	preview: string | null = $state(null);
	x = $state(0);
	y = $state(0);
	private readonly zones = new Set<CarryZone>();
	private source: HTMLElement | null = null;

	zone(zone: CarryZone) {
		this.zones.add(zone);
		return () => this.zones.delete(zone);
	}

	/** The pane other than `source` under a point, if any. */
	elsewhere(source: HTMLElement, x: number, y: number) {
		for (const zone of this.zones) {
			if (zone.element === source) continue;
			const rect = zone.element.getBoundingClientRect();
			if (x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom) return zone;
		}
		return null;
	}

	start(source: HTMLElement, item: Carried, preview: string | null) {
		this.source = source;
		this.item = item;
		this.preview = preview;
	}

	move(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	/** Puts what's carried where it was let go, when that's over the other pane. */
	end(drop: boolean) {
		const zone = drop && this.source ? this.elsewhere(this.source, this.x, this.y) : null;
		if (zone && this.item) zone.take(this.item, this.x, this.y);
		this.item = null;
		this.preview = null;
		this.source = null;
		return zone !== null;
	}
}

export const carry = new Carry();
