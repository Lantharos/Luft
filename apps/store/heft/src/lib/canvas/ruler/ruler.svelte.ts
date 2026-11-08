export const RULER_LENGTH = 1600;
export const RULER_DEPTH = 76;
const REACH = 26;
const SNAP_ANGLE = (2.5 * Math.PI) / 180;
const QUARTER = Math.PI / 4;

export type Guide = (x: number, y: number) => [number, number];

/**
 * A straightedge lying on the screen over the pages, in screen pixels from
 * the pane's corner, so it stays put while the page scrolls under it.
 */
export class Ruler {
	shown = $state(false);
	x = $state(0);
	y = $state(0);
	angle = $state(0);

	place(width: number, height: number) {
		this.x = width / 2;
		this.y = height * 0.55;
		this.angle = 0;
	}

	toggle(width: number, height: number) {
		if (!this.shown) this.place(width, height);
		this.shown = !this.shown;
	}

	moveBy(dx: number, dy: number) {
		this.x += dx;
		this.y += dy;
	}

	/** Turns to `angle`, settling on the nearest eighth of a turn when close to one. */
	turnTo(angle: number) {
		const nearest = Math.round(angle / QUARTER) * QUARTER;
		this.angle = Math.abs(angle - nearest) < SNAP_ANGLE ? nearest : angle;
	}

	degrees() {
		const degrees = Math.round((((-this.angle * 180) / Math.PI) % 180 + 180) % 180);
		return degrees > 90 ? 180 - degrees : degrees;
	}

	/**
	 * For a stroke starting at a point near either long edge, or on the ruler
	 * itself, keeps every point of it on that edge, `radius` away so the ink
	 * touches the edge rather than running under it.
	 */
	guide(x: number, y: number, radius: number): Guide | null {
		if (!this.shown) return null;
		const [along, across] = this.local(x, y);
		if (Math.abs(along) > RULER_LENGTH / 2 || Math.abs(across) > RULER_DEPTH / 2 + REACH) return null;
		const offset = Math.sign(across || 1) * (RULER_DEPTH / 2 + radius);
		const cos = Math.cos(this.angle);
		const sin = Math.sin(this.angle);
		return (pointX, pointY) => {
			const [position] = this.local(pointX, pointY);
			return [this.x + position * cos - offset * sin, this.y + position * sin + offset * cos];
		};
	}

	contains(x: number, y: number) {
		const [along, across] = this.local(x, y);
		return this.shown && Math.abs(along) <= RULER_LENGTH / 2 && Math.abs(across) <= RULER_DEPTH / 2;
	}

	private local(x: number, y: number): [number, number] {
		const dx = x - this.x;
		const dy = y - this.y;
		const cos = Math.cos(this.angle);
		const sin = Math.sin(this.angle);
		return [dx * cos + dy * sin, -dx * sin + dy * cos];
	}
}
