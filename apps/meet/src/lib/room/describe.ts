import { t } from '@luft/i18n';
import { bytes } from '@luft/ui';
import type { Contents, Place } from '#lib/bridge/meet.js';

export function placeTitle(place: Place): string {
	if (place.kind === 'windows') return t('room-place-windows');
	if (place.kind === 'whole') return t('room-place-whole', { drive: place.drive.name });
	return place.drive.windows ? t('room-place-free-here') : t('room-place-free', { drive: place.drive.name });
}

export function placeDetail(place: Place): string {
	if (place.kind === 'windows') {
		return place.free > 0 ? t('room-place-windows-free', { size: bytes(place.free) }) : t('room-place-windows-detail');
	}
	if (place.kind === 'whole') return t('room-place-whole-detail', { size: bytes(place.drive.size) });
	return t('room-place-free-detail', { size: bytes(place.most) });
}

export function volumeName(contents: Contents): string {
	const name = contents.label ?? t('room-erase-unnamed');
	return contents.letter ? t('room-erase-volume-name', { name, letter: contents.letter }) : name;
}

export function volumeDetail(contents: Contents): string {
	const size = bytes(contents.size);
	return contents.filesystem ? t('room-erase-volume', { filesystem: contents.filesystem, size }) : size;
}
