import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

function motion(duration: number) {
	return matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duration;
}

export function appear(_node: Element): TransitionConfig {
	return {
		duration: motion(220),
		easing: cubicOut,
		css: (t) => `opacity: ${t}; transform: scale(${0.97 + 0.03 * t})`
	};
}

export function disappear(_node: Element): TransitionConfig {
	return {
		duration: motion(160),
		easing: cubicOut,
		css: (t) => `opacity: ${t}; transform: scale(${1.015 - 0.015 * t})`
	};
}
