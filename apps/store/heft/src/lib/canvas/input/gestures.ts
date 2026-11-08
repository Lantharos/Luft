import { Gesture } from '@luft/ui';
import type { Viewport } from '../viewport.svelte';

interface Touch {
	x: number;
	y: number;
	startX: number;
	startY: number;
}

const TAP_TIME = 260;
const TAP_SLOP = 14;
const MIN_FLING = 120;

export interface GestureActions {
	undo(): void;
	redo(): void;
	/** A quick tap of one finger, where it touched. */
	tap(x: number, y: number): void;
	/** Scale and pan shown while a pinch is under way, before the zoom is applied. */
	preview(scale: number, x: number, y: number): void;
	settle(): void;
}

/** Fingers on the notebook: one pans or taps, two pan and zoom, a quick tap of two or three undoes or redoes. */
export class TouchGestures {
	private readonly touches = new Map<number, Touch>();
	private started = 0;
	private most = 0;
	private moved = false;
	private pinch: { distance: number; centerX: number; centerY: number; zoom: number } | null = null;
	private velocity = { x: 0, y: 0, time: 0 };
	private fling = 0;

	constructor(
		private readonly viewport: Viewport,
		private readonly actions: GestureActions,
		private readonly fingerPans: () => boolean
	) {}

	get active() {
		return this.touches.size > 0;
	}

	down(id: number, x: number, y: number, time: number) {
		cancelAnimationFrame(this.fling);
		if (!this.touches.size) {
			this.started = time;
			this.most = 0;
			this.moved = false;
		}
		this.touches.set(id, { x, y, startX: x, startY: y });
		this.most = Math.max(this.most, this.touches.size);
		this.velocity = { x: 0, y: 0, time };
		this.beginPinch();
	}

	move(id: number, x: number, y: number, time: number) {
		const touch = this.touches.get(id);
		if (!touch) return;
		const [beforeX, beforeY] = this.center();
		touch.x = x;
		touch.y = y;
		if (Math.hypot(x - touch.startX, y - touch.startY) > TAP_SLOP) this.moved = true;
		const [centerX, centerY] = this.center();
		if (this.pinch) {
			const scale = this.distance() / this.pinch.distance;
			this.actions.preview(scale, centerX - this.pinch.centerX * scale, centerY - this.pinch.centerY * scale);
			return;
		}
		if (!this.fingerPans() || !this.moved) return;
		const elapsed = Math.max(time - this.velocity.time, 1);
		const dx = beforeX - centerX;
		const dy = beforeY - centerY;
		this.velocity = { x: (dx / elapsed) * 1000, y: (dy / elapsed) * 1000, time };
		this.viewport.panBy(dx, dy);
	}

	up(id: number, time: number) {
		const touch = this.touches.get(id);
		if (!touch || !this.touches.delete(id)) return;
		if (this.pinch) {
			this.pinch = null;
			this.actions.settle();
		}
		if (this.touches.size) {
			this.beginPinch();
			return;
		}
		if (!this.moved && time - this.started < TAP_TIME) {
			if (this.most === 1) this.actions.tap(touch.startX, touch.startY);
			if (this.most === 2) this.actions.undo();
			if (this.most === 3) this.actions.redo();
		} else if (this.most === 1 && time - this.velocity.time < 60) this.flingFrom(this.velocity.x, this.velocity.y);
	}

	cancel() {
		this.touches.clear();
		if (this.pinch) this.actions.settle();
		this.pinch = null;
	}

	private beginPinch() {
		if (this.pinch) this.actions.settle();
		this.pinch = null;
		if (this.touches.size < 2) return;
		const [centerX, centerY] = this.center();
		this.pinch = { distance: Math.max(this.distance(), 1), centerX, centerY, zoom: this.viewport.zoom };
	}

	private center(): [number, number] {
		let x = 0;
		let y = 0;
		for (const touch of this.touches.values()) {
			x += touch.x;
			y += touch.y;
		}
		return [x / this.touches.size, y / this.touches.size];
	}

	private distance() {
		const [first, second] = [...this.touches.values()];
		return Math.hypot(first.x - second.x, first.y - second.y);
	}

	private flingFrom(velocityX: number, velocityY: number) {
		if (Math.hypot(velocityX, velocityY) < MIN_FLING) return;
		let last = performance.now();
		let vx = velocityX;
		let vy = velocityY;
		const step = (now: number) => {
			const elapsed = now - last;
			last = now;
			const decay = Gesture.deceleration ** elapsed;
			vx *= decay;
			vy *= decay;
			this.viewport.panBy((vx * elapsed) / 1000, (vy * elapsed) / 1000);
			if (Math.hypot(vx, vy) > 20) this.fling = requestAnimationFrame(step);
		};
		this.fling = requestAnimationFrame(step);
	}
}
