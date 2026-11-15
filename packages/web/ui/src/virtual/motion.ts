import { Role } from '@luft/motion';
import { motionPreference } from '../motion/preference';

export const MAX_STAGGER_MS = 60;

export function motionAllowed() {
	return motionPreference() === 'full';
}

export function animateEnter(node: HTMLElement, delay = 0) {
	node.animate([{ opacity: 0, scale: '0.96' }, { opacity: 1, scale: '1' }], {
		duration: Role.reveal.duration,
		delay,
		easing: Role.reveal.easing,
		fill: 'backwards'
	});
}

export function animateMoveFrom(node: HTMLElement, dx: number, dy: number) {
	node.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], { duration: Role.move.duration, easing: Role.move.easing });
}

export function animateMoveTo(node: HTMLElement, dx: number, dy: number) {
	return node.animate([{ translate: '0 0' }, { translate: `${dx}px ${dy}px` }], { duration: Role.move.duration, easing: Role.move.easing, fill: 'forwards' })
		.finished;
}

export function animateLeave(node: HTMLElement) {
	return node.animate([{ opacity: 1, scale: '1' }, { opacity: 0, scale: '0.96' }], {
		duration: Role.leave.duration,
		easing: Role.leave.easing,
		fill: 'forwards'
	}).finished;
}
