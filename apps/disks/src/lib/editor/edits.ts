import { editor } from './editor.svelte';
import type { Part, Span } from './model';

const sameFlags = (a: number[], b: number[]) => a.length === b.length && a.every((bit) => b.includes(bit));

export function place(part: Part, offset: number, size: number) {
	if (offset === part.offset && size === part.size) return;
	editor.push({ kind: 'place', key: part.key, offset, size });
}

export function create(gap: Span, filesystem: string) {
	const key = editor.newKey();
	editor.push({ kind: 'create', key, offset: gap.offset, size: gap.size, filesystem, label: '', type: '', name: '', flags: [] });
	editor.selected = key;
}

export function remove(part: Part) {
	editor.push({ kind: 'delete', key: part.key });
	editor.selected = null;
}

export function format(part: Part, filesystem: string) {
	editor.push({ kind: 'format', key: part.key, filesystem, label: part.label });
}

export function rename(part: Part, label: string) {
	if (label !== part.label) editor.push({ kind: 'change', key: part.key, label });
}

export function retype(part: Part, type: string) {
	if (type !== part.type) editor.push({ kind: 'change', key: part.key, type });
}

export function renamePartition(part: Part, name: string) {
	if (name !== part.name) editor.push({ kind: 'change', key: part.key, name });
}

export function setFlag(part: Part, bit: number, on: boolean) {
	const flags = on ? [...part.flags, bit] : part.flags.filter((flag) => flag !== bit);
	if (!sameFlags(flags, part.flags)) editor.push({ kind: 'change', key: part.key, flags });
}
