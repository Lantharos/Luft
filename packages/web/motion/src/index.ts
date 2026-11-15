import tokens from '../tokens.json' with { type: 'json' };
import type { SpringToken } from './spring';

export { cubicBezier } from './bezier';
export { DampedSpring, type SpringState, type SpringToken } from './spring';

type DurationName = keyof typeof tokens.duration;
type CurveName = keyof typeof tokens.curve;

export interface RoleToken {
	duration: number;
	curve: readonly number[];
	easing: string;
}

export const Duration: Readonly<Record<DurationName, number>> = tokens.duration;
export const Curve: Readonly<Record<CurveName, readonly number[]>> = tokens.curve;
export const Spring: Readonly<Record<keyof typeof tokens.spring, SpringToken>> = tokens.spring;
export const Gesture = tokens.gesture;
export const Feedback = tokens.feedback;

export const Role = Object.fromEntries(
	Object.entries(tokens.role).map(([name, { duration, curve }]) => {
		const points = Curve[curve as CurveName];
		return [name, { duration: Duration[duration as DurationName], curve: points, easing: `cubic-bezier(${points.join(', ')})` }];
	})
) as Readonly<Record<keyof typeof tokens.role, RoleToken>>;

export function rubberband(overshoot: number, dimension: number): number {
	const { rubberband: c } = tokens.gesture;
	return Math.sign(overshoot) * (1 - 1 / ((Math.abs(overshoot) * c) / dimension + 1)) * dimension;
}

export function projection(velocity: number): number {
	const { deceleration } = tokens.gesture;
	return ((velocity / 1000) * deceleration) / (1 - deceleration);
}
