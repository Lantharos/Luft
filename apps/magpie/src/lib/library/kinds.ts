import type { Kind } from '#lib/bridge/api.js';

export type Group = 'visual' | 'audio' | 'document' | 'font';

const GROUPS: Record<Kind, Group> = { image: 'visual', video: 'visual', audio: 'audio', document: 'document', font: 'font' };

export function groupOf(kind: Kind): Group {
	return GROUPS[kind];
}

export function extension(name: string) {
	const dot = name.lastIndexOf('.');
	return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

export function stem(name: string) {
	const dot = name.lastIndexOf('.');
	return dot > 0 ? name.slice(0, dot) : name;
}
