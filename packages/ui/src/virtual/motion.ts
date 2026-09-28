const EASE = 'cubic-bezier(0.2, 0, 0, 1)';
const ENTER_MS = 150;
const MOVE_MS = 240;
const LEAVE_MS = 140;

export const MAX_STAGGER_MS = 60;

const reducedMotion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

export function motionAllowed() {
	return !reducedMotion?.matches;
}

export function animateEnter(node: HTMLElement, delay = 0) {
	node.animate([{ opacity: 0, scale: '0.96' }, { opacity: 1, scale: '1' }], {
		duration: ENTER_MS,
		delay,
		easing: EASE,
		fill: 'backwards'
	});
}

export function animateMoveFrom(node: HTMLElement, dx: number, dy: number) {
	node.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], { duration: MOVE_MS, easing: EASE });
}

export function animateMoveTo(node: HTMLElement, dx: number, dy: number) {
	return node.animate([{ translate: '0 0' }, { translate: `${dx}px ${dy}px` }], { duration: MOVE_MS, easing: EASE, fill: 'forwards' })
		.finished;
}

export function animateLeave(node: HTMLElement) {
	return node.animate([{ opacity: 1, scale: '1' }, { opacity: 0, scale: '0.96' }], {
		duration: LEAVE_MS,
		easing: EASE,
		fill: 'forwards'
	}).finished;
}
