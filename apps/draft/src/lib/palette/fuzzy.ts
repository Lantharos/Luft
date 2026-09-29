export interface FuzzyMatch {
	score: number;
	indices: number[];
}

const SEPARATORS = new Set(['/', '\\', '_', '-', '.', ' ', ':']);

function boundaryBonus(target: string, index: number) {
	if (index === 0) return 10;
	const previous = target[index - 1];
	if (SEPARATORS.has(previous)) return 9;
	const current = target[index];
	return previous === previous.toLowerCase() && current !== current.toLowerCase() ? 7 : 0;
}

export function fuzzyMatch(query: string, target: string, lowered = target.toLowerCase()): FuzzyMatch | null {
	if (!query) return { score: 0, indices: [] };
	let position = -1;
	for (const character of query) {
		position = lowered.indexOf(character, position + 1);
		if (position < 0) return null;
	}
	const end = position;
	const indices: number[] = new Array(query.length);
	for (let queryIndex = query.length - 1; queryIndex >= 0; queryIndex--) {
		position = lowered.lastIndexOf(query[queryIndex], queryIndex === query.length - 1 ? end : position - 1);
		indices[queryIndex] = position;
	}
	let score = 0;
	for (let index = 0; index < indices.length; index++) {
		const at = indices[index];
		score += 1 + boundaryBonus(target, at);
		if (index > 0) {
			const gap = at - indices[index - 1] - 1;
			score += gap === 0 ? 6 : -Math.min(gap, 6);
		}
		if (target[at] === query[index]) score += 0.5;
	}
	return { score: score - target.length * 0.02, indices };
}

export function topMatches<T>(items: T[], limit: number, match: (item: T) => number | null) {
	const best: { item: T; score: number }[] = [];
	for (const item of items) {
		const score = match(item);
		if (score === null || (best.length === limit && score <= best[limit - 1].score)) continue;
		let index = best.length;
		while (index > 0 && best[index - 1].score < score) index--;
		best.splice(index, 0, { item, score });
		if (best.length > limit) best.pop();
	}
	return best.map(({ item }) => item);
}
