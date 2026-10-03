import { invoke } from '#lib/bridge.js';

export interface Character {
	text: string;
	name: string;
}

interface Indexed extends Character {
	lower: string;
	parts: string[];
	single: boolean;
}

interface Catalog {
	all: Indexed[];
	names: Map<string, string>;
}

const LIMIT = 300;

let loading: Promise<Catalog> | null = null;

function load() {
	loading ??= invoke<Character[]>('characters').then((list) => {
		const all = list
			.filter((character) => character.name)
			.map((character) => {
				const lower = character.name.toLowerCase();
				return { ...character, lower, parts: lower.split(' '), single: [...character.text].length === 1 };
			});
		return { all, names: new Map(all.map((character) => [character.text, character.name])) };
	});
	return loading;
}

function rank(character: Indexed, query: string, words: string[]) {
	if (character.text === query) return 0;
	if (character.lower === query) return 1;
	if (character.lower.startsWith(query)) return 2;
	if (words.every((word) => character.parts.some((part) => part.startsWith(word)))) return 3;
	if (character.lower.includes(query)) return 4;
	return -1;
}

export async function search(query: string, singleOnly: boolean): Promise<Character[]> {
	const { all } = await load();
	const needle = query.trim().toLowerCase();
	const usable = singleOnly ? all.filter((character) => character.single) : all;
	if (!needle) return usable.slice(0, LIMIT);
	const words = needle.split(/\s+/);
	return usable
		.map((character) => ({ character, score: rank(character, needle, words) }))
		.filter(({ score }) => score >= 0)
		.sort((left, right) => left.score - right.score)
		.slice(0, LIMIT)
		.map(({ character }) => character);
}

export async function nameOf(text: string): Promise<string | null> {
	const { names } = await load();
	return names.get(text) ?? null;
}
