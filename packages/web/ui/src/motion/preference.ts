import type { Motion } from '../bindings/appearance';

const systemReduced = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

export function calmed(motion: Motion): Motion {
	return motion === 'full' && systemReduced?.matches ? 'reduced' : motion;
}

export function followReducedMotion(change: () => void): () => void {
	systemReduced?.addEventListener('change', change);
	return () => systemReduced?.removeEventListener('change', change);
}

export function motionPreference(): Motion {
	const chosen = document.documentElement.dataset.motion;
	if (chosen === 'reduced' || chosen === 'off' || chosen === 'full') return chosen;
	return calmed('full');
}
