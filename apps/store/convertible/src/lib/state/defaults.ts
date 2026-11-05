import type { Edits, Options } from '#lib/bindings.js';

export const defaultOptions = (): Options => ({
	quality: 82,
	lossless: false,
	targetBytes: null,
	keepMetadata: true,
	width: null,
	height: null,
	frameRate: null,
	videoCodec: null,
	audio: 'keep',
	audioBitrate: null,
	sampleRate: null,
	channels: null,
	hardware: true,
	copyStreams: true,
	dpi: 150,
	pages: '',
	split: false,
	pageSize: 'fit',
	level: 6
});

export const noEdits = (): Edits => ({
	rotate: 0,
	flipHorizontal: false,
	flipVertical: false,
	crop: null,
	brightness: 0,
	contrast: 0,
	saturation: 0,
	marks: [],
	trim: null
});

export function isEdited(edits: Edits) {
	return (
		edits.rotate % 360 !== 0 ||
		edits.flipHorizontal ||
		edits.flipVertical ||
		edits.crop !== null ||
		edits.brightness !== 0 ||
		edits.contrast !== 0 ||
		edits.saturation !== 0 ||
		edits.marks.length > 0 ||
		edits.trim !== null
	);
}
