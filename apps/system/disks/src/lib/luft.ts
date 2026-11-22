import type { Drive, LuftRoom, Protection, Volume } from './bindings';
import { inner } from './format';

const ROOTS = ['/sysroot', '/'];
const MOVING = ['moving', 'finishing', 'paused'];

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


export function luftMoving(protection: Protection) {
	return MOVING.includes(protection.systemResize);
}

export function movingLuft(drive: Drive, protection: Protection) {
	if (!luftMoving(protection) || drive.id !== protection.resizeDrive) return null;
	const parts = drive.segments.flatMap((segment) => (segment.kind === 'volume' && protection.resizeParts.includes(segment.offset) ? [segment] : []));
	const luft = luftVolume(drive);
	const shown = parts.find((part) => part === luft) ?? parts[0];
	if (!shown) return null;
	return { shown, hidden: new Set(parts.filter((part) => part !== shown).map((part) => part.block)) };
}
