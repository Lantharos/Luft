import type { Drive, Volume } from '#lib/bindings.js';

const TONES = ['var(--accent)', 'var(--tertiary)', 'var(--secondary)'];

export function tones(drive: Drive, moving: { shown: Volume; hidden: Set<string> } | null) {
	const assigned = new Map<string, string>();
	let used = 0;
	for (const segment of drive.segments) {
		if (segment.kind === 'volume' && !moving?.hidden.has(segment.block)) assigned.set(segment.block, TONES[used++ % TONES.length]);
	}
	const tone = moving && assigned.get(moving.shown.block);
	if (tone) for (const block of moving.hidden) assigned.set(block, tone);
	return assigned;
}
