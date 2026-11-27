import type { Viewport } from './viewport.svelte';

const LINE = 40;
const ZOOM_SPEED = 0.0025;

type Point = { x: number; y: number };

export interface NavigationOptions {
	fingerPans: boolean;
}

export class Navigation {
	spaceHeld = false;
	#drag: { id: number; x: number; y: number } | null = null;
	#touches = new Map<number, Point>();
	#pinch: { distance: number; center: Point; scale: number } | null = null;

	constructor(
		private readonly element: HTMLElement,
		private readonly viewport: Viewport,
		private readonly options: NavigationOptions
	) {}

	local(event: { clientX: number; clientY: number }): Point {
		const rect = this.element.getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}

	wheel = (event: WheelEvent) => {
		event.preventDefault();
		const unit = event.deltaMode === 1 ? LINE : 1;
		const { x, y } = this.local(event);
		if (event.ctrlKey || event.metaKey) {
			this.viewport.zoomBy(Math.exp(-event.deltaY * unit * ZOOM_SPEED * (event.deltaMode === 1 ? 1 : 1.6)), x, y);
			return;
		}
		const dx = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
		const dy = event.shiftKey && !event.deltaX ? 0 : event.deltaY;
		this.viewport.panBy(-dx * unit, -dy * unit);
	};

	get panning() {
		return this.#drag !== null || this.#touches.size > 0;
	}

	claims(event: PointerEvent) {
		if (event.pointerType === 'touch') return this.options.fingerPans || this.#touches.size > 0;
		return event.button === 1 || (event.button === 0 && this.spaceHeld);
	}

	adopt(touch: PointerEvent) {
		this.#touches.set(touch.pointerId, this.local(touch));
	}

	down(event: PointerEvent) {
		this.element.setPointerCapture(event.pointerId);
		if (event.pointerType === 'touch') {
			this.#touches.set(event.pointerId, this.local(event));
			this.#startPinch();
			return;
		}
		this.#drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
	}

	move(event: PointerEvent) {
		if (event.pointerType === 'touch' && this.#touches.has(event.pointerId)) {
			const before = this.#centroid();
			this.#touches.set(event.pointerId, this.local(event));
			if (this.#touches.size === 1) {
				const after = this.#centroid();
				this.viewport.panBy(after.x - before.x, after.y - before.y);
				return;
			}
			this.#pinchMove();
			return;
		}
		if (this.#drag?.id !== event.pointerId) return false;
		this.viewport.panBy(event.clientX - this.#drag.x, event.clientY - this.#drag.y);
		this.#drag = { ...this.#drag, x: event.clientX, y: event.clientY };
	}

	up(event: PointerEvent) {
		this.#touches.delete(event.pointerId);
		this.#startPinch();
		if (this.#drag?.id === event.pointerId) this.#drag = null;
	}

	#centroid(): Point {
		const points = [...this.#touches.values()];
		return { x: points.reduce((sum, point) => sum + point.x, 0) / points.length, y: points.reduce((sum, point) => sum + point.y, 0) / points.length };
	}

	#spread() {
		const [a, b] = [...this.#touches.values()];
		return Math.hypot(a.x - b.x, a.y - b.y);
	}

	#startPinch() {
		this.#pinch = this.#touches.size >= 2 ? { distance: this.#spread(), center: this.#centroid(), scale: this.viewport.scale } : null;
	}

	#pinchMove() {
		if (!this.#pinch) return;
		const center = this.#centroid();
		this.viewport.panBy(center.x - this.#pinch.center.x, center.y - this.#pinch.center.y);
		this.viewport.zoomAt(this.#pinch.scale * (this.#spread() / this.#pinch.distance), center.x, center.y);
		this.#pinch.center = center;
	}
}
