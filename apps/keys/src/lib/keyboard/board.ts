import type { Levels } from '#lib/layout/api.js';
import type { Geometry } from './geometry';

export interface Board {
	readonly geometry: Geometry;
	readonly selected: string;
	readonly pressed: ReadonlySet<string>;
	readonly usesThirdLevel: boolean;
	readonly layer?: number | null;
	levels(name: string): Levels;
	select(name: string): void;
}

export function typedLevel(levels: Levels, level: number): number {
	if (level === 0 || levels[level].kind !== 'empty') return level;
	if (level === 3) return levels[2].kind !== 'empty' ? 2 : typedLevel(levels, 1);
	return 0;
}
