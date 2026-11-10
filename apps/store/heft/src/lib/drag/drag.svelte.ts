import type { Attachment } from 'svelte/attachments';

export type Payload = { kind: 'page'; notebook: string; page: string } | { kind: 'notebook'; id: string } | { kind: 'subject'; id: string };

export type Target = { kind: 'page'; notebook: string; page: string } | { kind: 'notebook'; id: string } | { kind: 'subject'; id: string };

export type DropHandler = (payload: Payload, target: Target, after: boolean) => void;

const THRESHOLD = 8;
const TOUCH_HOLD = 320;

class Drag {
	payload: Payload | null = $state(null);
	label = $state('');
	x = $state(0);
	y = $state(0);
	over: HTMLElement | null = null;
	handler: DropHandler = () => {};

	start(payload: Payload, label: string, x: number, y: number) {
		this.payload = payload;
		this.label = label;
		this.move(x, y);
	}

	move(x: number, y: number) {
		this.x = x;
		this.y = y;
		const element = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-drop]') ?? null;
		if (element === this.over) return;
		this.over?.removeAttribute('data-drop-over');
		this.over = element;
		element?.setAttribute('data-drop-over', '');
	}

	end(dropped: boolean) {
		const target = this.over && targets.get(this.over);
		if (dropped && this.payload && target && this.over) {
			const rect = this.over.getBoundingClientRect();
			this.handler(this.payload, target, this.y > rect.top + rect.height / 2);
		}
		this.over?.removeAttribute('data-drop-over');
		this.over = null;
		this.payload = null;
	}
}

export const drag = new Drag();
const targets = new WeakMap<HTMLElement, Target>();

export function dropTarget(target: Target): Attachment<HTMLElement> {
	return (element) => {
		targets.set(element, target);
		element.dataset.drop = '';
		return () => targets.delete(element);
	};
}

export function draggable(payload: () => Payload, label: () => string): Attachment<HTMLElement> {
	return (element) => {
		let start: { x: number; y: number; id: number; time: number } | null = null;
		let dragging = false;
		let hold = 0;

		const begin = (event: PointerEvent) => {
			dragging = true;
			element.setPointerCapture(event.pointerId);
			drag.start(payload(), label(), event.clientX, event.clientY);
		};
		const down = (event: PointerEvent) => {
			if (event.button !== 0) return;
			start = { x: event.clientX, y: event.clientY, id: event.pointerId, time: event.timeStamp };
			if (event.pointerType === 'touch') hold = window.setTimeout(() => begin(event), TOUCH_HOLD);
		};
		const move = (event: PointerEvent) => {
			if (!start || event.pointerId !== start.id) return;
			if (dragging) return drag.move(event.clientX, event.clientY);
			if (Math.hypot(event.clientX - start.x, event.clientY - start.y) < THRESHOLD) return;
			clearTimeout(hold);
			if (event.pointerType === 'touch') start = null;
			else begin(event);
		};
		const up = (event: PointerEvent) => {
			clearTimeout(hold);
			if (dragging) {
				drag.end(event.type === 'pointerup');
				const swallow = (click: Event) => click.stopPropagation();
				element.addEventListener('click', swallow, { capture: true, once: true });
				setTimeout(() => element.removeEventListener('click', swallow, { capture: true }));
			}
			dragging = false;
			start = null;
		};
		element.addEventListener('pointerdown', down);
		element.addEventListener('pointermove', move);
		element.addEventListener('pointerup', up);
		element.addEventListener('pointercancel', up);
		return () => {
			element.removeEventListener('pointerdown', down);
			element.removeEventListener('pointermove', move);
			element.removeEventListener('pointerup', up);
			element.removeEventListener('pointercancel', up);
		};
	};
}
