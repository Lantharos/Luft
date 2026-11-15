import { t } from '@luft/i18n';
import { caps, type Geometry } from '#lib/keyboard/geometry.js';
import { keyNames, type KeyName } from '#lib/keyboard/names.js';
import type { DeadKey, Layout } from '#lib/bindings.js';
import { placements } from './dead/table';

export type Target = { tab: 'keys'; key: string; level: number } | { tab: 'dead'; keysym: string } | { tab: 'settings' };

export interface Issue {
	id: string;
	text: string;
	target: Target;
}

const SHOWN_DUPLICATES = 4;
const SHARED_KEYS: Record<string, KeyName> = { ralt: 'rightAlt', rctrl: 'rightCtrl', menu: 'menu', rwin: 'rightSuper', caps: 'capsLock' };

export function typeable(layout: Layout) {
	const characters = new Set<string>();
	for (const symbol of Object.values(layout.keys).flat()) if (symbol.kind === 'character') characters.add(symbol.text);
	return characters;
}

function leadsBack(start: DeadKey, all: DeadKey[]) {
	const seen = new Set<string>();
	const queue = start.pairs.flatMap((pair) => (pair.next ? [pair.next] : []));
	while (queue.length) {
		const keysym = queue.shift()!;
		if (keysym === start.keysym) return true;
		if (seen.has(keysym)) continue;
		seen.add(keysym);
		for (const pair of all.find((key) => key.keysym === keysym)?.pairs ?? []) if (pair.next) queue.push(pair.next);
	}
	return false;
}

export function pairProblems(key: DeadKey, characters: Set<string>) {
	const problems = new Map<number, string>();
	const seen = new Map<string, number>();
	key.pairs.forEach((pair, index) => {
		const length = [...pair.base].length;
		if (length === 0) problems.set(index, t('keys-pair-no-key'));
		else if (length > 1 || pair.base.codePointAt(0)! > 0xffff) problems.set(index, t('keys-pair-one-key'));
		else if (seen.has(pair.base)) problems.set(index, t('keys-pair-repeated', { key: pair.base }));
		else if (!pair.text && !pair.next) problems.set(index, t('keys-pair-no-result'));
		else if (!characters.has(pair.base) && pair.base !== ' ') problems.set(index, t('keys-pair-untypeable', { key: pair.base }));
		if (length) seen.set(pair.base, index);
	});
	return problems;
}

function deadIssues(layout: Layout, characters: Set<string>): Issue[] {
	return layout.dead.flatMap((key) => {
		const target: Target = { tab: 'dead', keysym: key.keysym };
		const found: Issue[] = [];
		if (!placements(layout.keys, key.keysym).length) found.push({ id: `unplaced:${key.keysym}`, text: t('keys-issue-unplaced', { name: key.name }), target });
		if (leadsBack(key, layout.dead)) found.push({ id: `loop:${key.keysym}`, text: t('keys-issue-loop', { name: key.name }), target });
		const problems = pairProblems(key, characters).size;
		if (problems) found.push({ id: `pairs:${key.keysym}`, text: t('keys-issue-pairs', { name: key.name, count: problems }), target });
		return found;
	});
}

function keyIssues(layout: Layout, geometry: Geometry): Issue[] {
	const typing = caps(geometry).filter((cap) => !cap.label);
	const silent = typing.filter((cap) => (layout.keys[cap.name] ?? []).every((symbol) => symbol.kind === 'empty'));
	const found: Issue[] = [];
	if (silent.length) {
		found.push({
			id: 'silent',
			text: t('keys-issue-silent', { count: silent.length }),
			target: { tab: 'keys', key: silent[0].name, level: 0 }
		});
	}
	const shown = new Set(typing.map((cap) => cap.name));
	const places = new Map<string, { key: string; level: number }[]>();
	for (const [key, levels] of Object.entries(layout.keys)) {
		if (!shown.has(key)) continue;
		levels.forEach((symbol, level) => {
			if (symbol.kind !== 'character' || symbol.text === ' ') return;
			places.set(symbol.text, [...(places.get(symbol.text) ?? []), { key, level }]);
		});
	}
	const repeated = [...places].filter(([, at]) => new Set(at.map((place) => place.key)).size > 1);
	for (const [text, at] of repeated.slice(0, SHOWN_DUPLICATES)) {
		found.push({ id: `twice:${text}`, text: t('keys-issue-repeated', { character: text, count: at.length }), target: { tab: 'keys', ...at[1] } });
	}
	return found;
}

function settingIssues(layout: Layout, thirdLevel: boolean): Issue[] {
	const { altgr, compose } = layout.options;
	if (!thirdLevel || altgr !== compose || !SHARED_KEYS[altgr]) return [];
	return [{ id: 'shared', text: t('keys-issue-shared', { key: keyNames()[SHARED_KEYS[altgr]] }), target: { tab: 'settings' } }];
}

export function issues(layout: Layout, geometry: Geometry, thirdLevel: boolean): Issue[] {
	const characters = typeable(layout);
	return [...deadIssues(layout, characters), ...keyIssues(layout, geometry), ...settingIssues(layout, thirdLevel)];
}
