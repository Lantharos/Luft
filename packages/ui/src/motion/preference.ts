export type MotionPreference = 'full' | 'reduced' | 'off';

const systemReduced = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

export function motionPreference(): MotionPreference {
	const chosen = document.documentElement.dataset.motion;
	if (chosen === 'reduced' || chosen === 'off') return chosen;
	if (chosen === 'full') return 'full';
	return systemReduced?.matches ? 'reduced' : 'full';
}
