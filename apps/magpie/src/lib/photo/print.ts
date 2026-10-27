import { print } from '@lantharos/sabine';
import type { Item } from '#lib/bindings.js';
import { fileSource } from '#lib/bridge/index.js';
import { pngBlob } from './png';
import type { PhotoSource } from './source';

async function imageUrl(item: Item, source: PhotoSource) {
	if (source.type === 'element') return source.url;
	if (source.type === 'bitmap') return fileSource(item.path, item.modified);
	return URL.createObjectURL(await pngBlob(source));
}

export async function printPhoto(item: Item, source: PhotoSource) {
	const url = await imageUrl(item, source);
	const image = new Image();
	image.alt = item.name;
	image.style.cssText = 'position: fixed; visibility: hidden; pointer-events: none';
	image.src = url;
	document.body.append(image);
	try {
		await image.decode();
		await print.element(image);
	} finally {
		image.remove();
		if (source.type === 'pixels') URL.revokeObjectURL(url);
	}
}
