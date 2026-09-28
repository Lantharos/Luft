import type { VirtualRect } from '@luft/ui';

type Point = { x: number; y: number };

export interface MarqueeSurface {
	contentPoint(clientX: number, clientY: number): Point;
	indicesIn(area: VirtualRect): number[];
}

export class Marquee {
	box = $state.raw<{ start: Point; current: Point } | null>(null);
	style = $derived.by(() => {
		if (!this.box) return '';
		const area = normalize(this.box.start, this.box.current);
		return `left:${area.left}px;top:${area.top}px;width:${area.right - area.left}px;height:${area.bottom - area.top}px`;
	});

	#surface: () => MarqueeSurface | undefined;
	#pathAt: (index: number) => string | undefined;
	#onSelect: (paths: string[]) => void;
	#pointerId = -1;
	#client: Point = { x: 0, y: 0 };
	#base = new Set<string>();
	#signature = '';

	constructor(
		surface: () => MarqueeSurface | undefined,
		pathAt: (index: number) => string | undefined,
		onSelect: (paths: string[]) => void
	) {
		this.#surface = surface;
		this.#pathAt = pathAt;
		this.#onSelect = onSelect;
	}

	start = (event: PointerEvent, selection: Iterable<string>) => {
		const surface = this.#surface();
		if (!surface || event.button !== 0) return;
		if (event.target instanceof Element && event.target.closest('[data-entry-path], button, input')) return;
		this.#base = event.ctrlKey || event.metaKey ? new Set(selection) : new Set();
		this.#pointerId = event.pointerId;
		this.#client = { x: event.clientX, y: event.clientY };
		const point = surface.contentPoint(event.clientX, event.clientY);
		this.box = { start: point, current: point };
		this.#signature = '';
		this.#select();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		event.preventDefault();
	};

	move = (event: PointerEvent) => {
		if (event.pointerId !== this.#pointerId || !this.box) return;
		this.#track({ x: event.clientX, y: event.clientY });
	};

	end = (event: PointerEvent) => {
		if (event.pointerId !== this.#pointerId || !this.box) return;
		this.#track({ x: event.clientX, y: event.clientY });
		this.#pointerId = -1;
		this.box = null;
	};

	scroll = () => {
		if (this.box) this.#track(this.#client);
	};

	#track(client: Point) {
		const surface = this.#surface();
		if (!this.box || !surface) return;
		this.#client = client;
		this.box = { ...this.box, current: surface.contentPoint(client.x, client.y) };
		this.#select();
	}

	#select() {
		const surface = this.#surface();
		if (!this.box || !surface) return;
		const paths = new Set(this.#base);
		for (const index of surface.indicesIn(normalize(this.box.start, this.box.current))) {
			const path = this.#pathAt(index);
			if (path) paths.add(path);
		}
		const signature = [...paths].join('\n');
		if (signature === this.#signature) return;
		this.#signature = signature;
		this.#onSelect([...paths]);
	}
}

function normalize(start: Point, current: Point): VirtualRect {
	return {
		left: Math.min(start.x, current.x),
		top: Math.min(start.y, current.y),
		right: Math.max(start.x, current.x),
		bottom: Math.max(start.y, current.y)
	};
}
