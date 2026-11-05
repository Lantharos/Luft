import { pngBlob } from './png';
import type { PhotoSource } from './source';

export async function copyImage(source: PhotoSource) {
	await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob(source) })]);
}
