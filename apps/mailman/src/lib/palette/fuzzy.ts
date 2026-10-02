export function score(text: string, query: string) {
	const haystack = text.toLowerCase();
	const needle = query.toLowerCase().trim();
	if (!needle) return 1;
	const direct = haystack.indexOf(needle);
	if (direct >= 0) return 1000 - direct - (haystack.length - needle.length) / 100;
	let position = 0;
	let gaps = 0;
	for (const character of needle) {
		const found = haystack.indexOf(character, position);
		if (found < 0) return 0;
		gaps += found - position;
		position = found + 1;
	}
	return 500 - gaps;
}
