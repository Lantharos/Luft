import type { Nib, Tool } from './stroke';

const RANGE: Record<Nib, [number, number]> = {
	fountain: [0.28, 1.3],
	ballpoint: [0.82, 1.06]
};

export const PRESSURE_WITHOUT_A_SENSOR = 0.55;

export function curve(pressure: number, firmness: number): number {
	return Math.max(0, Math.min(1, pressure)) ** 2 ** (firmness * 1.3);
}

export function widthAt(tool: Tool, nib: Nib, width: number, pressure: number): number {
	if (tool === 'highlighter') return width;
	const [low, high] = RANGE[nib];
	return width * (low + (high - low) * pressure);
}
