import {
	edgeOf,
	elementTo,
	isVerticalEdge,
	islandTo,
	spotNear,
	stepElement,
	stepIsland,
	type Arrangement,
	type Box,
	type Direction,
	type IslandBox,
	type Spot
} from '@luft/ui/taskbar';

const THRESHOLD = 4;
const AROUND_ISLAND = 6;
const KEYS: Record<string, Direction> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

export interface ShownIsland {
	spot: Spot;
	elements: string[];
	box: Box;
}

/** What a drag picked up: an island by its handle, or one element out of an island. */
export type Grip = { island: Spot } | { element: string };

export interface ArrangingHost {
	arrangement(): Arrangement;
	islands(): ShownIsland[];
	targets(): IslandBox[];
	joined(): boolean;
	/** Where the screen's top left corner is on the page. */
	origin(): { x: number; y: number };
	/** The middle of each element on the screen, along its island. */
	middles(spot: Spot): { element: string; middle: number }[];
	save(arrangement: Arrangement): void;
}

/** Dragging the preview's islands and elements to other spots, or moving them with the arrow keys, with the result shown as it goes. */
export class Arranging {
	draft = $state<Arrangement | null>(null);
	grip = $state<Grip | null>(null);
	pointer = $state({ x: 0, y: 0 });
	offset = $state({ x: 0, y: 0 });
	aimed = $state<Spot | null>(null);
	#pressed: { grip: Grip; x: number; y: number; offset: { x: number; y: number } } | null = null;
	#reach: () => number;

	constructor(
		private readonly host: ArrangingHost,
		reach: () => number
	) {
		this.#reach = reach;
	}

	get dragging() {
		return this.grip !== null;
	}

	press(event: PointerEvent, grip: Grip, box: Box) {
		if (event.button !== 0) return;
		const { x, y } = this.#local(event);
		this.#pressed = { grip, x, y, offset: { x: x - box.x, y: y - box.y } };
		(event.currentTarget as Element).setPointerCapture(event.pointerId);
	}

	move(event: PointerEvent) {
		const pressed = this.#pressed;
		if (!pressed) return;
		const { x, y } = this.#local(event);
		if (!this.grip && Math.hypot(x - pressed.x, y - pressed.y) < THRESHOLD) return;
		if (!this.grip) {
			this.grip = pressed.grip;
			this.offset = pressed.offset;
		}
		this.pointer = { x, y };
		this.draft = this.#aim(pressed.grip, x, y);
	}

	release() {
		this.#pressed = null;
		const draft = this.draft;
		this.grip = null;
		this.aimed = null;
		this.draft = null;
		if (draft) this.host.save(draft);
	}

	key(event: KeyboardEvent, grip: Grip) {
		const direction = KEYS[event.key];
		if (!direction) return;
		event.preventDefault();
		const { arrangement, targets, joined } = this.host;
		const moved =
			'island' in grip
				? stepIsland(arrangement(), grip.island, direction, targets(), joined())
				: stepElement(arrangement(), grip.element, direction, targets(), joined(), document.dir === 'rtl');
		this.host.save(moved);
	}

	#local(event: PointerEvent) {
		const origin = this.host.origin();
		return { x: event.clientX - origin.x, y: event.clientY - origin.y };
	}

	#aim(grip: Grip, x: number, y: number): Arrangement {
		const arrangement = this.host.arrangement();
		const joined = this.host.joined();
		const spot = spotNear(this.host.targets(), x, y, this.#reach());
		if ('island' in grip) {
			this.aimed = spot;
			return spot ? islandTo(arrangement, grip.island, spot, joined) : arrangement;
		}
		const island = this.host.islands().find(({ box }) => within(box, x, y, AROUND_ISLAND));
		if (island) {
			this.aimed = null;
			const vertical = isVerticalEdge(edgeOf(island.spot));
			const others = this.host.middles(island.spot).filter(({ element }) => element !== grip.element);
			const index = others.filter(({ middle }) => middle < (vertical ? y : x)).length;
			return elementTo(arrangement, grip.element, island.spot, index, joined);
		}
		this.aimed = spot;
		return spot ? elementTo(arrangement, grip.element, spot, Infinity, joined) : arrangement;
	}
}

function within({ x, y, width, height }: Box, px: number, py: number, around: number) {
	return px >= x - around && px < x + width + around && py >= y - around && py < y + height + around;
}
