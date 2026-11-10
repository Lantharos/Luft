import { Duration } from '@luft/motion';
import { flip } from 'svelte/animate';
import { decelerate } from './easing';
import { motionPreference } from './preference';

export function reorder(node: Element, rects: { from: DOMRect; to: DOMRect }) {
	return flip(node, rects, { duration: motionPreference() === 'full' ? Duration.standard : 0, easing: decelerate });
}
