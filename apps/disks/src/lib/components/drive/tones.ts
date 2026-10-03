import type { Drive } from '#lib/api.js';

const TONES = ['var(--accent)', 'var(--tertiary)', 'var(--secondary)'];

export function tones(drive: Drive) {
	const assigned = new Map<string, string>();
	for (const segment of drive.segments) {
		if (segment.kind === 'volume') assigned.set(segment.block, TONES[assigned.size % TONES.length]);
	}
	return assigned;
}
