type Point = { x: number; y: number };
type Rect = { left: number; top: number; right: number; bottom: number };
type Box = { pointerId: number; start: Point; current: Point; client: Point };

export class Marquee {
	box = $state.raw<Box | null>(null);
	style = $derived.by(() => {
		if (!this.box) return '';
		const rect = normalize(this.box);
		return `left:${rect.left}px;top:${rect.top}px;width:${rect.right - rect.left}px;height:${rect.bottom - rect.top}px`;
	});

	#pane: () => HTMLElement | undefined;
	#onSelect: (paths: string[]) => void;
	#items: { path: string; rect: Rect }[] = [];
	#base = new Set<string>();
	#selected = '';

	constructor(pane: () => HTMLElement | undefined, onSelect: (paths: string[]) => void) {
		this.#pane = pane;
		this.#onSelect = onSelect;
	}

	start = (event: PointerEvent, selection: Iterable<string>) => {
		const pane = this.#pane();
		if (!pane || event.button !== 0) return;
		if (event.target instanceof Element && event.target.closest('button, input')) return;
		this.#base = event.ctrlKey || event.metaKey ? new Set(selection) : new Set();
		this.#items = [...pane.querySelectorAll<HTMLElement>('[data-entry-path]')].map((element) => ({
			path: element.dataset.entryPath!,
			rect: contentRect(pane, element.getBoundingClientRect())
		}));
		const client = { x: event.clientX, y: event.clientY };
		const point = contentPoint(pane, client);
		this.box = { pointerId: event.pointerId, start: point, current: point, client };
		this.#selected = '';
		this.#select();
		pane.setPointerCapture(event.pointerId);
		event.preventDefault();
	};

	move = (event: PointerEvent) => {
		if (this.box?.pointerId !== event.pointerId) return;
		this.#track({ x: event.clientX, y: event.clientY });
	};

	end = (event: PointerEvent) => {
		if (this.box?.pointerId !== event.pointerId) return;
		this.#track({ x: event.clientX, y: event.clientY });
		this.#pane()?.releasePointerCapture(event.pointerId);
		this.box = null;
		this.#items = [];
	};

	scroll = () => {
		if (this.box) this.#track(this.box.client);
	};

	#track(client: Point) {
		const pane = this.#pane();
		if (!this.box || !pane) return;
		this.box = { ...this.box, current: contentPoint(pane, client), client };
		this.#select();
	}

	#select() {
		if (!this.box) return;
		const area = normalize(this.box);
		const paths = new Set(this.#base);
		for (const item of this.#items) if (intersects(item.rect, area)) paths.add(item.path);
		const signature = [...paths].join('\n');
		if (signature === this.#selected) return;
		this.#selected = signature;
		this.#onSelect([...paths]);
	}
}

function normalize(box: Box): Rect {
	return {
		left: Math.min(box.start.x, box.current.x),
		top: Math.min(box.start.y, box.current.y),
		right: Math.max(box.start.x, box.current.x),
		bottom: Math.max(box.start.y, box.current.y)
	};
}

function contentPoint(pane: HTMLElement, client: Point): Point {
	const rect = pane.getBoundingClientRect();
	return { x: client.x - rect.left + pane.scrollLeft, y: client.y - rect.top + pane.scrollTop };
}

function contentRect(pane: HTMLElement, rect: DOMRect): Rect {
	const origin = contentPoint(pane, { x: rect.left, y: rect.top });
	return { left: origin.x, top: origin.y, right: origin.x + rect.width, bottom: origin.y + rect.height };
}

function intersects(a: Rect, b: Rect) {
	return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
