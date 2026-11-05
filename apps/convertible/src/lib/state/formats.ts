import { t } from '@luft/i18n';
import type { Family } from '#lib/bindings.js';

export const LOSSY = ['jpeg', 'webp', 'avif', 'heic', 'jxl'];
export const VIDEO = ['mp4', 'webm', 'mkv', 'mov', 'avi'];
export const LOSSY_AUDIO = ['mp3', 'm4a', 'ogg', 'opus'];
export const AUDIO = [...LOSSY_AUDIO, 'flac', 'wav', 'aiff'];
export const ARCHIVE = ['zip', '7z', 'tar', 'tar.gz', 'tar.xz', 'tar.zst', 'tar.bz2'];
export const PAGE_IMAGES = ['png', 'jpeg', 'webp', 'tiff'];

export const CONTAINER_CODECS: Record<string, readonly string[]> = {
	mp4: ['h264', 'hevc', 'av1'],
	webm: ['vp9', 'av1', 'vp8'],
	mkv: ['h264', 'hevc', 'av1', 'vp9', 'vp8', 'ffv1'],
	mov: ['h264', 'hevc', 'prores'],
	avi: ['h264']
};

export const CODEC_NAMES: Record<string, string> = {
	h264: 'H.264',
	hevc: 'H.265',
	av1: 'AV1',
	vp9: 'VP9',
	vp8: 'VP8',
	prores: 'ProRes',
	ffv1: 'FFV1'
};

export function familyName(family: Family) {
	switch (family) {
		case 'image':
			return t('family-image');
		case 'video':
			return t('family-video');
		case 'audio':
			return t('family-audio');
		case 'document':
			return t('family-document');
		case 'sheet':
			return t('family-sheet');
		case 'archive':
			return t('family-archive');
		case 'font':
			return t('family-font');
	}
}

export function missingReason(id: string) {
	switch (id) {
		case 'heic':
			return t('missing-heic');
		case 'avif':
			return t('missing-avif');
		case 'jxl':
			return t('missing-jxl');
		case 'mp3':
			return t('missing-mp3');
		case 'm4a':
			return t('missing-aac');
		case 'mp4':
		case 'mov':
		case 'avi':
			return t('missing-h264');
		default:
			return t('missing-other');
	}
}
