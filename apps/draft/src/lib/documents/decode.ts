import type { Backend } from '$lib/bridge/types';
import type { LineEnding } from './encodings';

const SNIFF_BYTES = 8000;
const BOMS: { bytes: number[]; encoding: string }[] = [
	{ bytes: [0xef, 0xbb, 0xbf], encoding: 'utf-8' },
	{ bytes: [0xff, 0xfe], encoding: 'utf-16le' },
	{ bytes: [0xfe, 0xff], encoding: 'utf-16be' }
];

export interface DecodedText {
	text: string;
	encoding: string;
	bom: boolean;
	lineEnding: LineEnding;
}

export class BinaryFileError extends Error {
	constructor() {
		super('This file doesn’t contain text');
	}
}

function byteOrderMark(bytes: Uint8Array) {
	return BOMS.find((bom) => bom.bytes.every((byte, index) => bytes[index] === byte))?.encoding ?? null;
}

function lineEnding(text: string): LineEnding {
	const newline = text.indexOf('\n');
	return newline > 0 && text.charCodeAt(newline - 1) === 13 ? 'crlf' : 'lf';
}

function strictUtf8(bytes: Uint8Array) {
	try {
		return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
	} catch {
		return null;
	}
}

export async function decode(bytes: Uint8Array, path: string, backend: Backend, forced?: string): Promise<DecodedText> {
	const marked = byteOrderMark(bytes);
	const encoding = forced ?? marked;
	if (!encoding?.startsWith('utf-16') && bytes.subarray(0, SNIFF_BYTES).includes(0)) throw new BinaryFileError();
	const text = encoding ? new TextDecoder(encoding).decode(bytes) : strictUtf8(bytes);
	if (text !== null) return { text, encoding: encoding ?? 'utf-8', bom: marked !== null && marked === encoding, lineEnding: lineEnding(text) };
	const detected = await backend.detectEncoding(path);
	const decoded = new TextDecoder(detected).decode(bytes);
	return { text: decoded, encoding: detected, bom: false, lineEnding: lineEnding(decoded) };
}
