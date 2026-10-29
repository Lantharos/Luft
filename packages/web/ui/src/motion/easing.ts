import { Curve, cubicBezier, DampedSpring, type SpringToken } from '@luft/motion';
import { motionPreference } from './preference';

const SPRING_REST = 0.002;

export const decelerate = cubicBezier(Curve.decelerate);

/** A spring from rest as a timed easing, for Svelte transitions. */
export function springEasing(token: SpringToken) {
	const spring = new DampedSpring(token, { offset: -1, velocity: 0 });
	const seconds = spring.settleTime(SPRING_REST);
	return { duration: seconds * 1000, easing: (t: number) => (t >= 1 ? 1 : 1 + spring.at(t * seconds).offset) };
}

const LINEAR_SAMPLES = 32;

/** Web Animations timing for a spring from rest; instant unless motion is on in full. */
export function springTiming(token: SpringToken): KeyframeAnimationOptions {
	if (motionPreference() !== 'full') return { duration: 0 };
	const { duration, easing } = springEasing(token);
	const points = Array.from({ length: LINEAR_SAMPLES + 1 }, (_, step) => easing(step / LINEAR_SAMPLES).toFixed(4));
	return { duration, easing: `linear(${points.join(', ')})` };
}
