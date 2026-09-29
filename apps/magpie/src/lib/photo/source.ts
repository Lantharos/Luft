import type { Item } from '$lib/api';
import * as api from '$lib/api';
import { fileSource } from '$lib/bridge';
import { extension } from '$lib/library/kinds';
import { isAnimated } from './animated';

export type PhotoSource =
	| { type: 'bitmap'; width: number; height: number; image: ImageBitmap }
	| { type: 'pixels'; width: number; height: number; channels: 3 | 4; data: Uint8Array }
	| { type: 'element'; width: number; height: number; url: string };

const ELEMENT_EXTENSIONS = ['svg', 'gif'];
const FALLBACK_SIZE = 1024;

const loaded = new Map<string, Promise<PhotoSource>>();

function key(item: Item) {
	return `${item.path}\n${item.modified}`;
}

async function pixels(item: Item): Promise<PhotoSource> {
	const decoded = await api.decodeImage(item.path);
	const response = await fetch(fileSource(decoded.path));
	const data = new Uint8Array(await response.arrayBuffer());
	return { type: 'pixels', width: decoded.width, height: decoded.height, channels: decoded.channels, data };
}

async function element(item: Item): Promise<PhotoSource> {
	const url = fileSource(item.path, item.modified);
	const image = new Image();
	image.src = url;
	await image.decode();
	const width = image.naturalWidth || FALLBACK_SIZE;
	const height = image.naturalHeight || FALLBACK_SIZE;
	return { type: 'element', width, height, url };
}

async function load(item: Item): Promise<PhotoSource> {
	if (item.native) return pixels(item);
	if (ELEMENT_EXTENSIONS.includes(extension(item.name))) return element(item);
	const response = await fetch(fileSource(item.path, item.modified));
	const blob = await response.blob();
	if (await isAnimated(blob)) return element(item);
	try {
		const image = await createImageBitmap(blob, { imageOrientation: 'from-image' });
		return { type: 'bitmap', width: image.width, height: image.height, image };
	} catch {
		return pixels(item);
	}
}

export function loadPhoto(item: Item) {
	let promise = loaded.get(key(item));
	if (!promise) {
		promise = load(item);
		loaded.set(key(item), promise);
		promise.catch(() => loaded.delete(key(item)));
	}
	return promise;
}

export function keepPhotos(items: Item[]) {
	const kept = new Set(items.map(key));
	for (const [cached, promise] of loaded) {
		if (kept.has(cached)) continue;
		loaded.delete(cached);
		void promise.then((source) => source.type === 'bitmap' && source.image.close(), () => {});
	}
}
