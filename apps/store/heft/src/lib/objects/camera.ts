import { invoke } from '@lantharos/sabine';
import { commands } from '#lib/bindings.js';

const JPEG = 0;
const HEADER = 12;

export const openCamera = () => commands.cameraOpen();

export const closeCamera = () => commands.cameraClose();

export async function cameraFrame(): Promise<ImageBitmap | ImageData | null> {
	const bytes = await invoke<Uint8Array>('camera_frame', {});
	if (bytes.length <= HEADER) return null;
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const pixels = bytes.subarray(HEADER);
	if (bytes[0] === JPEG) return createImageBitmap(new Blob([pixels as BlobPart], { type: 'image/jpeg' }));
	return new ImageData(new Uint8ClampedArray(pixels.buffer as ArrayBuffer, pixels.byteOffset, pixels.byteLength), view.getUint32(4, true), view.getUint32(8, true));
}
