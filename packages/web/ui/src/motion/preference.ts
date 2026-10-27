import type { Motion } from '../bindings/appearance';

const systemReduced = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

export function motionPreference(): Motion {
	const chosen = document.documentElement.dataset.motion;
	if (chosen === 'reduced' || chosen === 'off') return chosen;
	if (chosen === 'full') return 'full';
	return systemReduced?.matches ? 'reduced' : 'full';
}
