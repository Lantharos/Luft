import { US_LABELS } from '$lib/keyboard/geometry';
import type { DeadKey, Levels, Pair, Symbol } from '../api';

export interface Placement {
	key: string;
	level: number;
}

export function deadSymbol(key: DeadKey): Symbol {
	return { keysym: key.keysym, text: key.symbol, kind: 'dead' };
}

function single(text: string) {
	return [...text].length === 1;
}

export function capitals(pairs: Pair[]): Pair[] {
	const bases = new Set(pairs.map((pair) => pair.base));
	return pairs.flatMap((pair) => {
		const base = pair.base.toUpperCase();
		const text = pair.text.toUpperCase();
		if (!single(pair.base) || !single(base) || base === pair.base || bases.has(base) || pair.next) return [];
		bases.add(base);
		return [{ base, text }];
	});
}

export function placements(keys: Record<string, Levels>, keysym: string): Placement[] {
	return Object.entries(keys).flatMap(([key, levels]) => levels.flatMap((symbol, level) => (symbol.keysym === keysym ? [{ key, level }] : [])));
}

export interface Typed {
	text: string;
	pending: DeadKey | null;
}

export function typeAfter(key: DeadKey, character: string, all: DeadKey[]): Typed {
	const pair = key.pairs.find((candidate) => candidate.base === character);
	const next = pair?.next ? all.find((candidate) => candidate.keysym === pair.next) : undefined;
	if (next) return { text: '', pending: next };
	if (pair) return { text: pair.text, pending: null };
	if (character === ' ') return { text: key.spacing, pending: null };
	return { text: key.spacing + character, pending: null };
}

export function standardName(keysym: string) {
	const name = keysym.replace(/^dead_/, '').replaceAll('_', ' ');
	return name.charAt(0).toUpperCase() + name.slice(1);
}

const LEVEL_PREFIX = ['On', 'With Shift on', 'With AltGr on', 'With Shift and AltGr on'];

export function placeName(key: string, levels: Levels, level: number) {
	const base = levels[0];
	const label = base.kind === 'character' && base.text.trim() ? base.text.toUpperCase() : (US_LABELS[key] ?? key);
	return `${LEVEL_PREFIX[level]} the ${label} key`;
}
