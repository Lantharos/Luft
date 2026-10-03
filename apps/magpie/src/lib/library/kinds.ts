import type { Item, Kind } from '#lib/api.js';

export type Group = 'visual' | 'audio' | 'document' | 'font';

const GROUPS: Record<Kind, Group> = { image: 'visual', video: 'visual', audio: 'audio', document: 'document', font: 'font' };

export function groupOf(kind: Kind): Group {
	return GROUPS[kind];
}

export function sameGroup(a: Item, b: Item) {
	return groupOf(a.kind) === groupOf(b.kind);
}

export function extension(name: string) {
	const dot = name.lastIndexOf('.');
	return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

export function isVector(item: Item) {
	return extension(item.name) === 'svg';
}

export function parent(path: string) {
	const slash = path.lastIndexOf('/');
	return slash > 0 ? path.slice(0, slash) : '/';
}

export function baseName(path: string) {
	return path.slice(path.lastIndexOf('/') + 1);
}

export function stem(name: string) {
	const dot = name.lastIndexOf('.');
	return dot > 0 ? name.slice(0, dot) : name;
}
