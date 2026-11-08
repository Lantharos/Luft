import type { Nib, Tool } from './stroke';

const RANGE: Record<Nib, [number, number]> = {
	fountain: [0.28, 1.3],
	ballpoint: [0.82, 1.06]
};

/** The steady pressure of a mouse or a finger, which report none of their own. */
export const STEADY = 0.55;

/**
 * Bends pressure by `firmness`, from -1 (a light touch reaches full width) to
 * 1 (it takes a firm press), with 0 leaving it as the pen reports it.
 */
export function curve(pressure: number, firmness: number): number {
	return Math.max(0, Math.min(1, pressure)) ** 2 ** (firmness * 1.3);
}

export function widthAt(tool: Tool, nib: Nib, width: number, pressure: number): number {
	if (tool === 'highlighter') return width;
	const [low, high] = RANGE[nib];
	return width * (low + (high - low) * pressure);
}
