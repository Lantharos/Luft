import { t } from '@luft/i18n';
import { basename } from '@luft/ui';
import type { Location, Place } from '#lib/bindings.js';

export function placeName(place: Place) {
	switch (place) {
		case 'pictures':
			return t('magpie-place-pictures');
		case 'videos':
			return t('magpie-place-videos');
		case 'music':
			return t('magpie-place-music');
		case 'documents':
			return t('magpie-place-documents');
	}
}

export function folderTitle(path: string, places: Location[]) {
	const place = places.find((location) => location.path === path)?.place;
	return place ? placeName(place) : basename(path);
}
