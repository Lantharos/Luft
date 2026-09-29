import type { Text } from '@codemirror/state';

const CHUNK_CHARS = 4 * 1024 * 1024;

function* pieces(text: Text, lineBreak: string) {
	let first = true;
	for (const line of text.iterLines()) {
		if (!first) yield lineBreak;
		first = false;
		for (let offset = 0; offset < line.length; offset += CHUNK_CHARS) yield line.slice(offset, offset + CHUNK_CHARS);
	}
}

export function* textChunks(text: Text, lineBreak: string) {
	let parts: string[] = [];
	let size = 0;
	for (const piece of pieces(text, lineBreak)) {
		parts.push(piece);
		size += piece.length;
		if (size < CHUNK_CHARS) continue;
		yield parts.join('');
		parts = [];
		size = 0;
	}
	if (parts.length) yield parts.join('');
}
