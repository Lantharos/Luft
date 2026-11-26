import type { Projective } from '#lib/gpu/matrix.js';
import type { Rect } from '#lib/gpu/tiles.js';

export type Overlay =
	| { kind: 'marquee'; shape: 'rectangle' | 'ellipse'; rect: Rect }
	| { kind: 'lasso'; points: number[] }
	| { kind: 'line'; from: [number, number]; to: [number, number] }
	| { kind: 'transform'; width: number; height: number; x: number; y: number; matrix: Projective }
	| { kind: 'crop'; rect: Rect }
	| { kind: 'brush'; x: number; y: number; radius: number }
	| { kind: 'point'; x: number; y: number };
