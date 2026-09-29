import type { Attachment } from 'svelte/attachments';
import type { Viewport } from './viewport.svelte';

const WHEEL_ZOOM = 0.0025;
const LINE_HEIGHT = 33;
const SWIPE_DISTANCE = 80;
const TRACKPAD_SWIPE = 140;
const TRACKPAD_SETTLE_MS = 220;

interface Point {
	x: number;
	y: number;
}

interface Pinch {
	distance: number;
	scale: number;
	middle: Point;
}

function distance(a: Point, b: Point) {
	return Math.hypot(a.x - b.x, a.y - b.y);
}

function middle(a: Point, b: Point): Point {
	return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function photoGestures(viewport: Viewport, navigate: (direction: 1 | -1) => void): Attachment<HTMLElement> {
	return (node) => {
		const pointers = new Map<number, Point>();
		let pinch: Pinch | null = null;
		let swipeStart: Point | null = null;
		let travel = 0;
		let settle: ReturnType<typeof setTimeout> | undefined;
		let swiped = false;

		const local = (event: MouseEvent): Point => {
			const box = node.getBoundingClientRect();
			return { x: event.clientX - box.left, y: event.clientY - box.top };
		};

		const trackpadSwipe = (deltaX: number) => {
			clearTimeout(settle);
			settle = setTimeout(() => {
				travel = 0;
				swiped = false;
			}, TRACKPAD_SETTLE_MS);
			if (swiped) return;
			travel += deltaX;
			if (Math.abs(travel) < TRACKPAD_SWIPE) return;
			swiped = true;
			navigate(travel > 0 ? 1 : -1);
		};

		const wheel = (event: WheelEvent) => {
			event.preventDefault();
			const point = local(event);
			const lines = event.deltaMode === WheelEvent.DOM_DELTA_LINE;
			const mouse = lines || (event.deltaX === 0 && Math.abs(event.deltaY) >= 50 && Number.isInteger(event.deltaY));
			if (event.ctrlKey || mouse) {
				const delta = lines ? event.deltaY * LINE_HEIGHT : event.deltaY;
				viewport.zoomBy(Math.exp(-delta * WHEEL_ZOOM), point.x, point.y, mouse && !event.ctrlKey);
			} else if (viewport.zoomed) {
				viewport.pan(-event.deltaX, -event.deltaY);
			} else if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
				trackpadSwipe(event.deltaX);
			}
		};

		const down = (event: PointerEvent) => {
			if (event.pointerType === 'mouse' && event.button !== 0) return;
			node.setPointerCapture(event.pointerId);
			pointers.set(event.pointerId, local(event));
			const [first, second] = [...pointers.values()];
			if (second) {
				pinch = { distance: distance(first, second), scale: viewport.scale, middle: middle(first, second) };
				swipeStart = null;
			} else {
				swipeStart = event.pointerType === 'mouse' || viewport.zoomed ? null : first;
			}
			node.classList.toggle('dragging', viewport.zoomed);
		};

		const move = (event: PointerEvent) => {
			const previous = pointers.get(event.pointerId);
			if (!previous) return;
			const point = local(event);
			pointers.set(event.pointerId, point);
			const [first, second] = [...pointers.values()];
			if (pinch && second) {
				const center = middle(first, second);
				viewport.zoomTo(pinch.scale * (distance(first, second) / pinch.distance), center.x, center.y, false);
				viewport.pan(center.x - pinch.middle.x, center.y - pinch.middle.y);
				pinch.middle = center;
			} else if (viewport.zoomed) {
				viewport.pan(point.x - previous.x, point.y - previous.y);
			}
		};

		const up = (event: PointerEvent) => {
			const point = pointers.get(event.pointerId);
			pointers.delete(event.pointerId);
			if (pointers.size < 2) pinch = null;
			node.classList.remove('dragging');
			if (!swipeStart || !point || pointers.size) return;
			const deltaX = point.x - swipeStart.x;
			swipeStart = null;
			if (Math.abs(deltaX) >= SWIPE_DISTANCE) navigate(deltaX < 0 ? 1 : -1);
		};

		const doubleClick = (event: MouseEvent) => {
			const point = local(event);
			viewport.actualSize(point.x, point.y);
		};

		node.addEventListener('wheel', wheel, { passive: false });
		node.addEventListener('pointerdown', down);
		node.addEventListener('pointermove', move);
		node.addEventListener('pointerup', up);
		node.addEventListener('pointercancel', up);
		node.addEventListener('dblclick', doubleClick);
		return () => {
			clearTimeout(settle);
			node.removeEventListener('wheel', wheel);
			node.removeEventListener('pointerdown', down);
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerup', up);
			node.removeEventListener('pointercancel', up);
			node.removeEventListener('dblclick', doubleClick);
		};
	};
}
