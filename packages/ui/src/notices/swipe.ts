import { Spring } from '@luft/motion';
import type { Attachment } from 'svelte/attachments';
import { SpringValue } from '../motion/spring';

const SLOP = 4;
const DISMISS_SHARE = 0.4;
const FLING_SPEED = 500;
const FADE_SHARE = 0.75;

/** Lets a notice be swiped sideways off screen, following the pointer 1:1. */
export function swipeAway(ondismiss: () => void): Attachment<HTMLElement> {
	return (node) => {
		const width = () => node.offsetWidth;
		const offset = new SpringValue(node, (x) => ({
			translate: `${x}px 0`,
			opacity: `${1 - Math.min(1, Math.abs(x) / (width() * FADE_SHARE))}`
		}));
		let start: { x: number; pointer: number } | null = null;
		let dragging = false;
		let last = { x: 0, time: 0, velocity: 0 };

		const down = (event: PointerEvent) => {
			if (event.button !== 0 || (event.target as Element).closest('button')) return;
			start = { x: event.clientX - offset.value, pointer: event.pointerId };
			last = { x: event.clientX, time: event.timeStamp, velocity: 0 };
		};

		const move = (event: PointerEvent) => {
			if (!start || event.pointerId !== start.pointer) return;
			const x = event.clientX - start.x;
			if (!dragging && Math.abs(x) < SLOP) return;
			if (!dragging) node.setPointerCapture(event.pointerId);
			dragging = true;
			const elapsed = event.timeStamp - last.time;
			if (elapsed > 0) last = { x: event.clientX, time: event.timeStamp, velocity: ((event.clientX - last.x) / elapsed) * 1000 };
			offset.set(x);
		};

		const up = (event: PointerEvent) => {
			if (!start || event.pointerId !== start.pointer) return;
			start = null;
			if (!dragging) return;
			dragging = false;
			const x = offset.value;
			const velocity = event.timeStamp - last.time > 100 ? 0 : last.velocity;
			const thrown = Math.abs(velocity) > FLING_SPEED && Math.sign(velocity) === Math.sign(x);
			if (!thrown && Math.abs(x) < width() * DISMISS_SHARE) {
				void offset.to(0, { velocity });
				return;
			}
			node.dataset.swiped = '';
			node.inert = true;
			const away = Math.sign(x || velocity) * (width() + 48);
			void offset.to(away, { velocity, spring: Spring.thrown }).then(ondismiss);
		};

		node.addEventListener('pointerdown', down);
		node.addEventListener('pointermove', move);
		node.addEventListener('pointerup', up);
		node.addEventListener('pointercancel', up);
		return () => {
			node.removeEventListener('pointerdown', down);
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerup', up);
			node.removeEventListener('pointercancel', up);
		};
	};
}
