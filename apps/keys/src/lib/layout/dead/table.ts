import { US_LABELS } from '#lib/keyboard/geometry.js';
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

const POSITIONS = ['below', 'above'];
const PREFIXES = ['double', 'inverted', 'reversed'];

function split(word: string): string[] {
	const position = POSITIONS.find((candidate) => word.startsWith(candidate) && word.length > candidate.length);
	if (position) return [...split(word.slice(position.length)), position];
	const prefix = PREFIXES.find((candidate) => word.startsWith(candidate) && word.length > candidate.length);
	return prefix ? [prefix, ...split(word.slice(prefix.length))] : [word];
}

export function standardName(keysym: string) {
	const name = keysym.replace(/^dead_/, '').split('_').flatMap(split).join(' ');
	return name.charAt(0).toUpperCase() + name.slice(1);
}

const LEVEL_PREFIX = ['on', 'with Shift on', 'with AltGr on', 'with Shift and AltGr on'];

function placeName(key: string, levels: Levels, level: number) {
	const base = levels[0];
	const label = base.kind !== 'empty' && base.kind !== 'function' && base.text.trim() ? base.text.toUpperCase() : (US_LABELS[key] ?? key);
	return `${LEVEL_PREFIX[level]} the ${label} key`;
}

export function whereIs(keys: Record<string, Levels>, keysym: string) {
	const phrases = placements(keys, keysym).map((place) => placeName(place.key, keys[place.key], place.level));
	if (!phrases.length) return 'Not on a key yet';
	const sentence = phrases.length === 1 ? phrases[0] : `${phrases.slice(0, -1).join(', ')} and ${phrases.at(-1)}`;
	return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
