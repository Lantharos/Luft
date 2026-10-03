import type { Tags } from '#lib/api.js';
import { baseName, stem } from '#lib/library/kinds.js';

export interface Track extends Tags {
	name: string;
}

export function trackFrom(tags: Tags): Track {
	return { ...tags, name: stem(baseName(tags.path)) };
}

export function trackTitle(track: Track) {
	return track.title ?? track.name;
}

export function trackArtist(track: Track) {
	return track.artist ?? track.albumArtist;
}

export function albumOrder(tracks: Track[]) {
	const numbered = tracks.filter((track) => track.track !== null).length;
	if (numbered < tracks.length / 2) return tracks;
	return tracks.toSorted(
		(a, b) =>
			(a.album ?? '').localeCompare(b.album ?? '') ||
			(a.disc ?? 1) - (b.disc ?? 1) ||
			(a.track ?? Infinity) - (b.track ?? Infinity) ||
			a.name.localeCompare(b.name, undefined, { numeric: true })
	);
}

export function shuffled(count: number, first: number) {
	const order = Array.from({ length: count }, (_, index) => index).filter((index) => index !== first);
	for (let index = order.length - 1; index > 0; index--) {
		const swap = Math.floor(Math.random() * (index + 1));
		[order[index], order[swap]] = [order[swap], order[index]];
	}
	return first >= 0 ? [first, ...order] : order;
}
