import { fileUrl } from '@lantharos/sabine';

const TEXT_LIMIT = 256 * 1024;
const SNIFF_BYTES = 8192;

export type TextPreview = { text: string; truncated: boolean } | { binary: true };

export async function loadText(path: string, size: number, signal: AbortSignal): Promise<TextPreview> {
	const response = await fetch(fileUrl(path), { headers: { Range: `bytes=0-${TEXT_LIMIT - 1}` }, signal });
	const bytes = new Uint8Array(await response.arrayBuffer());
	if (bytes.subarray(0, SNIFF_BYTES).includes(0)) return { binary: true };
	return { text: new TextDecoder().decode(bytes), truncated: size > bytes.length };
}
