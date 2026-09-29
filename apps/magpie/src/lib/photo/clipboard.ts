import type { PhotoSource } from './source';

async function canvasBlob(source: PhotoSource) {
	const canvas = new OffscreenCanvas(source.width, source.height);
	const context = canvas.getContext('2d')!;
	if (source.type === 'bitmap') {
		context.drawImage(source.image, 0, 0);
	} else if (source.type === 'pixels') {
		const rgba = new Uint8ClampedArray(source.width * source.height * 4);
		for (let pixel = 0, from = 0; pixel < rgba.length; pixel += 4, from += source.channels) {
			rgba[pixel] = source.data[from];
			rgba[pixel + 1] = source.data[from + 1];
			rgba[pixel + 2] = source.data[from + 2];
			rgba[pixel + 3] = source.channels === 4 ? source.data[from + 3] : 255;
		}
		context.putImageData(new ImageData(rgba, source.width, source.height), 0, 0);
	} else {
		const image = new Image();
		image.src = source.url;
		await image.decode();
		context.drawImage(image, 0, 0, source.width, source.height);
	}
	return canvas.convertToBlob({ type: 'image/png' });
}

export async function copyImage(source: PhotoSource) {
	await navigator.clipboard.write([new ClipboardItem({ 'image/png': canvasBlob(source) })]);
}
