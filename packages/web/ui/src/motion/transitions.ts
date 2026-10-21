import { Duration, Spring, type SpringToken } from '@luft/motion';
import type { TransitionConfig } from 'svelte/transition';
import { decelerate, springEasing } from './easing';
import { motionPreference } from './preference';

interface Shape {
	/** Vertical offset in pixels the element arrives from or leaves toward. */
	y?: number;
	scale?: number;
}

interface Enter extends Shape {
	duration?: number;
	spring?: SpringToken;
}

interface Exit extends Shape {
	duration?: number;
	/** How long the fade takes, when it is shorter than the movement. */
	fade?: number;
}

type Options = { direction: 'in' | 'out' | 'both' };

const linear = (t: number) => t;
const still: TransitionConfig = { duration: 0 };

function transform({ y = 0, scale = 1 }: Shape, amount: number) {
	return `transform: translateY(${y * amount}px) scale(${1 + (scale - 1) * amount});`;
}

function arrive(enter: Enter): TransitionConfig {
	const preference = motionPreference();
	if (preference === 'off') return still;
	if (preference === 'reduced') return { duration: Duration.quick, easing: linear, css: (t) => `opacity: ${t};` };
	const timing = enter.spring ? springEasing(enter.spring) : { duration: enter.duration ?? Duration.standard, easing: decelerate };
	const fade = Math.min(1, Duration.quick / timing.duration);
	return { ...timing, css: (t, u) => `opacity: ${Math.min(1, t / fade)}; ${transform(enter, u)}` };
}

function depart(node: Element, exit: Exit): TransitionConfig {
	if (node instanceof HTMLElement) node.inert = true;
	const preference = motionPreference();
	if (preference === 'off') return still;
	if (preference === 'reduced') return { duration: Duration.tap, easing: linear, css: (t) => `opacity: ${t};` };
	const duration = exit.duration ?? Duration.quick;
	const fade = Math.min(1, (exit.fade ?? duration) / duration);
	return { duration, easing: linear, css: (_, u) => `opacity: ${Math.max(0, 1 - u / fade)}; ${transform(exit, decelerate(u))}` };
}

function presence(enter: Enter, exit: Exit) {
	return (node: Element, _params?: unknown, options?: Options) => (options?.direction === 'out' ? depart(node, exit) : arrive(enter));
}

/** Menus and popovers fade out at once; they enter through CSS once placed. */
export const menu = presence({ y: -4, scale: 0.98 }, { duration: Duration.tap });

/** Dialogs settle from slightly larger, and grow away as they close. */
export const dialog = presence({ scale: 1.05 }, { scale: 1.05, fade: Duration.tap });

/** Things that only fade, such as the dimmed layer behind a dialog. */
export const fade = presence({}, {});

/** Small notices rise from the bottom edge on a spring. */
export const toast = presence({ y: 16, spring: Spring.snappy }, { y: 8 });

/** Items arriving in and leaving a list, next to `reorder`. */
export const item = presence({ scale: 0.98 }, {});

/** Pages and views replacing each other in place. */
export const page = presence({ y: 16 }, {});
