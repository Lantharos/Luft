import { parseColor, type Rgba } from '#lib/raster/color.js';

export interface Look {
	ink: string;
	paper: string;
	grid: Rgba;
	noteText: string;
}

export const DARK: Look = { ink: '#e9e4da', paper: '#1c1b18', grid: [1, 1, 1, 0.11], noteText: '#2a251c' };
export const LIGHT: Look = { ink: '#2a2824', paper: '#f7f6f2', grid: [0, 0, 0, 0.13], noteText: '#2a251c' };
export const PRINT: Look = { ...LIGHT, paper: '#ffffff' };
export const INK = 'ink';

export const resolve = (color: string, look: Look) => (color === INK ? look.ink : color);
export const rgba = (color: string, look: Look, alpha = 1): Rgba => {
	const [r, g, b, a] = parseColor(resolve(color, look));
	return [r, g, b, a * alpha];
};
