const SNIFF_BYTES = 1 << 16;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function ascii(bytes: Uint8Array, at: number, length = 4) {
	return String.fromCharCode(...bytes.subarray(at, at + length));
}

function animatedPng(bytes: Uint8Array, view: DataView) {
	if (!PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) return false;
	for (let at = 8; at + 8 <= bytes.length; ) {
		const type = ascii(bytes, at + 4);
		if (type === 'acTL') return true;
		if (type === 'IDAT') return false;
		at += 12 + view.getUint32(at);
	}
	return false;
}

function animatedWebp(bytes: Uint8Array) {
	return ascii(bytes, 0) === 'RIFF' && ascii(bytes, 8) === 'WEBP' && ascii(bytes, 12) === 'VP8X' && (bytes[20] & 0x02) !== 0;
}

function animatedAvif(bytes: Uint8Array, view: DataView) {
	if (bytes.length < 16 || ascii(bytes, 4) !== 'ftyp') return false;
	const end = Math.min(bytes.length, view.getUint32(0));
	for (let at = 8; at + 4 <= end; at += 4) if (ascii(bytes, at) === 'avis') return true;
	return false;
}

export async function isAnimated(blob: Blob) {
	const bytes = new Uint8Array(await blob.slice(0, SNIFF_BYTES).arrayBuffer());
	const view = new DataView(bytes.buffer);
	return animatedPng(bytes, view) || animatedWebp(bytes) || animatedAvif(bytes, view);
}
