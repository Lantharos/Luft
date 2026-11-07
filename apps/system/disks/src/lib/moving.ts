import { bytes } from '@luft/ui';
import type { LuftMove, MoveChoice, MoveDestination, MoveShrink } from './bindings';

const MiB = 1024 * 1024;

export type Place = { kind: 'free' } | { kind: 'shrink'; block: string } | { kind: 'erase' };

export function alignDown(value: number) {
	return Math.floor(value / MiB) * MiB;
}

export function shrinkRoom(shrink: MoveShrink) {
	return alignDown(shrink.size - shrink.smallest + shrink.freeAfter - shrink.startup);
}

export function freeRoom(destination: MoveDestination) {
	return destination.free ? alignDown(destination.free.size - destination.free.startup) : 0;
}

export function largest(destination: MoveDestination, place: Place) {
	if (place.kind === 'free') return freeRoom(destination);
	if (place.kind === 'erase') return destination.erase.luft;
	const shrink = destination.shrink.find((candidate) => candidate.block === place.block);
	return shrink ? shrinkRoom(shrink) : 0;
}

export function fits(options: LuftMove, destination: MoveDestination, place: Place) {
	return largest(destination, place) >= options.needs.luft;
}

export function usable(options: LuftMove, destination: MoveDestination) {
	if (destination.refused) return false;
	const places: Place[] = [{ kind: 'free' }, ...destination.shrink.map((shrink) => ({ kind: 'shrink', block: shrink.block }) as Place)];
	return places.some((place) => fits(options, destination, place)) || (!destination.erase.refused && fits(options, destination, { kind: 'erase' }));
}

export function driveNote(options: LuftMove, destination: MoveDestination) {
	if (destination.refused) return destination.refused;
	if (fits(options, destination, { kind: 'free' })) return `${bytes(destination.free?.size ?? 0)} free`;
	const shrink = destination.shrink.find((candidate) => fits(options, destination, { kind: 'shrink', block: candidate.block }));
	if (shrink) return `Room can be made on ${shrink.name}`;
	if (!destination.erase.refused && fits(options, destination, { kind: 'erase' })) return 'Can be erased for Luft';
	if (destination.erase.refused && destination.size >= options.needs.luft) return destination.erase.refused;
	return `Too small. Luft needs ${bytes(options.needs.luft)}`;
}

export function shrunkSize(shrink: MoveShrink, luft: number) {
	const taken = Math.max(0, luft + shrink.startup - shrink.freeAfter);
	return Math.max(shrink.smallest, alignDown(shrink.size - taken));
}

export function choice(destination: MoveDestination, place: Place, luft: number): MoveChoice {
	if (place.kind === 'erase') return { kind: 'erase', drive: destination.drive };
	if (place.kind === 'free') {
		const free = destination.free!;
		return { kind: 'free', drive: destination.drive, offset: free.offset, size: Math.min(free.size, alignDown(luft + free.startup)) };
	}
	const shrink = destination.shrink.find((candidate) => candidate.block === place.block)!;
	return { kind: 'shrink', drive: destination.drive, block: shrink.block, size: shrunkSize(shrink, luft), luft: alignDown(luft + shrink.startup) };
}
