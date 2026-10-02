const PANGRAM = 'The quick brown fox jumps over the lazy dog';
const FALLBACK_LENGTH = 32;

export type Ranges = [number, number][];

export function covers(ranges: Ranges, text: string) {
	return [...text].every((character) => {
		const codepoint = character.codePointAt(0)!;
		if (/\s/.test(character)) return true;
		let low = 0;
		let high = ranges.length - 1;
		while (low <= high) {
			const middle = (low + high) >> 1;
			const [start, end] = ranges[middle];
			if (codepoint < start) high = middle - 1;
			else if (codepoint > end) low = middle + 1;
			else return true;
		}
		return false;
	});
}

export function count(ranges: Ranges) {
	return ranges.reduce((total, [start, end]) => total + end - start + 1, 0);
}

export function codepoints(ranges: Ranges) {
	const list = new Uint32Array(count(ranges));
	let offset = 0;
	for (const [start, end] of ranges) for (let codepoint = start; codepoint <= end; codepoint++) list[offset++] = codepoint;
	return list;
}

function visible(ranges: Ranges, limit: number) {
	const found: string[] = [];
	for (const [start, end] of ranges) {
		for (let codepoint = start; codepoint <= end && found.length < limit; codepoint++) {
			const character = String.fromCodePoint(codepoint);
			if (!/\s/.test(character)) found.push(character);
		}
	}
	return found.join('');
}

export function sampleText(ranges: Ranges, provided: string | null) {
	if (provided && covers(ranges, provided)) return provided;
	if (covers(ranges, PANGRAM)) return PANGRAM;
	return visible(ranges, FALLBACK_LENGTH);
}

export function headline(ranges: Ranges, family: string) {
	return covers(ranges, family) ? family : visible(ranges, 8);
}

export function hex(codepoint: number) {
	return `U+${codepoint.toString(16).toUpperCase().padStart(4, '0')}`;
}
