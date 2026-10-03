import type { Location, Place } from '#lib/api.js';
import { baseName } from './kinds';

export const PLACE_NAMES: Record<Place, string> = {
	pictures: 'Pictures',
	videos: 'Videos',
	music: 'Music',
	documents: 'Documents'
};

export function folderTitle(path: string, places: Location[]) {
	const place = places.find((location) => location.path === path)?.place;
	return place ? PLACE_NAMES[place] : baseName(path) || '/';
}
