import { i18n, resolved, t } from '@luft/i18n';
import { US_LABELS } from '#lib/keyboard/geometry.js';
import { keyNames } from '#lib/keyboard/names.js';
import type { DeadKey, Pair, Symbol } from '#lib/bindings.js';
import type { Levels } from '#lib/layout/levels.js';

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

function spelledName(keysym: string) {
	const name = keysym.replace(/^dead_/, '').split('_').flatMap(split).join(' ');
	return name.charAt(0).toUpperCase() + name.slice(1);
}

const standardNames = resolved(() => new Map<string, string>());

export function standardName(keysym: string) {
	const names = standardNames();
	let name = names.get(keysym);
	if (name === undefined) {
		name = t('keys-dead-standard', { keysym, spelled: spelledName(keysym) });
		names.set(keysym, name);
	}
	return name;
}

const places = resolved(() => new Intl.ListFormat(i18n.locale, { type: 'conjunction' }));

function placeName(key: string, levels: Levels, level: number) {
	const base = levels[0];
	const label = base.kind !== 'empty' && base.kind !== 'function' && base.text.trim() ? base.text.toUpperCase() : key === 'SPCE' ? keyNames().space : (US_LABELS[key] ?? key);
	return t('keys-dead-where', { level, key: label });
}

export function whereIs(keys: Record<string, Levels>, keysym: string) {
	const phrases = placements(keys, keysym).map((place) => placeName(place.key, keys[place.key], place.level));
	if (!phrases.length) return t('keys-dead-unplaced');
	const sentence = places().format(phrases);
	return sentence.charAt(0).toLocaleUpperCase(i18n.locale) + sentence.slice(1);
}

const OWN_DEAD_FIRST = 0xec40;
const OWN_DEAD_LAST = 0xecff;

export function ownDeadKeysym(character: string) {
	const point = character.codePointAt(0)!;
	return point >= OWN_DEAD_FIRST && point <= OWN_DEAD_LAST ? `U${point.toString(16).toUpperCase()}` : null;
}
