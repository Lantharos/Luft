import tokens from '../tokens.json' with { type: 'json' };
import type { SpringToken } from './spring';

export { cubicBezier } from './bezier';
export { DampedSpring, type SpringState, type SpringToken } from './spring';

export const Duration: Readonly<Record<keyof typeof tokens.duration, number>> = tokens.duration;
export const Curve: Readonly<Record<keyof typeof tokens.curve, readonly number[]>> = tokens.curve;
export const Spring: Readonly<Record<keyof typeof tokens.spring, SpringToken>> = tokens.spring;
export const Gesture = tokens.gesture;

export function rubberband(overshoot: number, dimension: number): number {
	const { rubberband: c } = tokens.gesture;
	return Math.sign(overshoot) * (1 - 1 / ((Math.abs(overshoot) * c) / dimension + 1)) * dimension;
}

export function projection(velocity: number): number {
	const { deceleration } = tokens.gesture;
	return ((velocity / 1000) * deceleration) / (1 - deceleration);
}
