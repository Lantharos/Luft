import type { Drive, LuftRoom, Volume } from './bindings';
import { inner } from './format';

const ROOTS = ['/sysroot', '/'];

export function luftRoom(drive: Drive, offset: number): LuftRoom | null {
	return drive.luft.find((room) => room.offset === offset) ?? null;
}

export function luftVolume(drive: Drive): Volume | null {
	for (const segment of drive.segments) {
		if (segment.kind === 'volume' && inner(segment).mountPoints.some((point) => ROOTS.includes(point))) return segment;
	}
	return null;
}

export function roomAfter(drive: Drive) {
	return drive.luft.find((room) => room.reach.kind === 'after') ?? null;
}

