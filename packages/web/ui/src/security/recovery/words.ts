import list from '@luft/recovery-key/english.txt?raw';

const WORDS = list.trim().split('\n');
const KEY_WORDS = 12;
const SHORTEST_PREFIX = 4;

export function completeWord(typed: string): string | null {
	const lower = typed.trim().toLowerCase();
	if (!lower) return null;
	let low = 0;
	let high = WORDS.length;
	while (low < high) {
		const middle = (low + high) >> 1;
		if (WORDS[middle] < lower) low = middle + 1;
		else high = middle;
	}
	const found = WORDS[low];
	if (found === lower || (lower.length >= SHORTEST_PREFIX && found?.startsWith(lower))) return found;
	return null;
}

export function keyWords(key: string): string[] | null {
	const words = key.split(' ');
	return words.length === KEY_WORDS ? words : null;
}

export function pickWords(count: number): number[] {
	const picked = new Set<number>();
	const random = new Uint32Array(1);
	while (picked.size < count) {
		crypto.getRandomValues(random);
		picked.add(random[0] % KEY_WORDS);
	}
	return [...picked].sort((a, b) => a - b);
}
