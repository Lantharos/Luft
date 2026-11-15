const MARKER = /\uE000(\d+)\uE001/;

export interface Piece<K extends string> {
	text: string;
	key: K | null;
}

export function marks<K extends string>(values: Record<K, string>) {
	const keys = Object.keys(values) as K[];
	const args = Object.fromEntries(keys.map((key, index) => [key, `\uE000${index}\uE001`])) as Record<K, string>;
	const split = (text: string): Piece<K>[] =>
		text
			.split(MARKER)
			.map((part, index) => (index % 2 ? { text: values[keys[Number(part)]], key: keys[Number(part)] } : { text: part, key: null }))
			.filter((piece) => piece.text);
	return { args, split };
}
