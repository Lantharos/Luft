export const SLIDE_MS = 420;

const EASING = 'cubic-bezier(0.2, 0, 0, 1)';
let reduced: MediaQueryList | undefined;

export function slide(element: HTMLElement, distance: number) {
	for (const animation of element.getAnimations()) animation.cancel();
	reduced ??= matchMedia('(prefers-reduced-motion: reduce)');
	if (reduced.matches) return;
	element.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-distance}px)` }], { duration: SLIDE_MS, easing: EASING });
}
