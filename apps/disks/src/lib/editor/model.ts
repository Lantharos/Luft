import type { Drive, Volume } from '#lib/api.js';
import { inner, volumeName } from '#lib/format.js';
import type { Table } from '#lib/partitions/types.js';

export const MiB = 1024 ** 2;
const GPT_ENTRIES = 128;
const DOS_PRIMARIES = 4;
const DOS_LIMIT = 2 * 1024 ** 4;

export interface Part {
	key: string;
	pending: boolean;
	number: number | null;
	offset: number;
	size: number;
	type: string;
	name: string;
	flags: number[];
	label: string;
	filesystem: string;
	usage: string;
	used: number | null;
	mounted: boolean;
	encrypted: boolean;
	locked: boolean;
	system: boolean;
	logical: boolean;
	replaced: boolean;
	title: string;
}

export interface Span {
	offset: number;
	size: number;
}

export interface Layout {
	table: Table;
	start: number;
	end: number;
	extended: Span | null;
	parts: Part[];
}

export type Step =
	| { kind: 'create'; key: string; offset: number; size: number; filesystem: string; label: string; type: string; name: string; flags: number[] }
	| { kind: 'delete'; key: string }
	| { kind: 'place'; key: string; offset: number; size: number }
	| { kind: 'format'; key: string; filesystem: string; label: string }
	| { kind: 'change'; key: string; type?: string; name?: string; flags?: number[]; label?: string };

export const alignDown = (value: number) => Math.floor(value / MiB) * MiB;
export const alignUp = (value: number) => Math.ceil(value / MiB) * MiB;
export const end = (span: Span) => span.offset + span.size;

function part(volume: Volume): Part {
	const contents = inner(volume);
	return {
		key: volume.block,
		pending: false,
		number: volume.number,
		offset: volume.offset,
		size: volume.size,
		type: volume.partitionType ?? '',
		name: volume.partitionName,
		flags: volume.flags,
		label: contents.label,
		filesystem: contents.fsType,
		usage: contents.usage,
		used: contents.used,
		mounted: contents.mountPoints.length > 0,
		encrypted: Boolean(volume.encryption),
		locked: Boolean(volume.encryption && !volume.encryption.cleartext),
		system: volume.system || Boolean(volume.encryption?.cleartext?.system),
		logical: volume.logical,
		replaced: false,
		title: volumeName(volume)
	};
}

export function layoutOf(drive: Drive): Layout | null {
	if (!drive.table) return null;
	const limit = drive.table === 'dos' ? Math.min(drive.size, DOS_LIMIT) : drive.size;
	return {
		table: drive.table,
		start: MiB,
		end: alignDown(limit - (drive.table === 'gpt' ? MiB : 0)),
		extended: drive.extended,
		parts: drive.segments.flatMap((segment) => (segment.kind === 'volume' && segment.number !== null ? [part(segment)] : []))
	};
}

const sorted = (parts: Part[]) => [...parts].sort((a, b) => a.offset - b.offset);

function updated(layout: Layout, key: string, change: (part: Part) => Part): Layout {
	return { ...layout, parts: sorted(layout.parts.map((candidate) => (candidate.key === key ? change(candidate) : candidate))) };
}

export function apply(layout: Layout, step: Step): Layout {
	switch (step.kind) {
		case 'create': {
			const created: Part = {
				key: step.key,
				pending: true,
				number: null,
				offset: step.offset,
				size: step.size,
				type: step.type,
				name: step.name,
				flags: step.flags,
				label: step.label,
				filesystem: step.filesystem,
				usage: step.filesystem ? 'filesystem' : '',
				used: step.filesystem ? 0 : null,
				mounted: false,
				encrypted: false,
				locked: false,
				system: false,
				logical: inside(layout.extended, step),
				replaced: true,
				title: step.label || step.name || 'New partition'
			};
			return { ...layout, parts: sorted([...layout.parts, created]) };
		}
		case 'delete':
			return { ...layout, parts: layout.parts.filter((candidate) => candidate.key !== step.key) };
		case 'place':
			return updated(layout, step.key, (target) => ({ ...target, offset: step.offset, size: step.size, mounted: target.mounted && target.offset === step.offset }));
		case 'format':
			return updated(layout, step.key, (target) => ({
				...target,
				filesystem: step.filesystem,
				label: step.label,
				usage: 'filesystem',
				used: 0,
				mounted: false,
				encrypted: false,
				locked: false,
				replaced: true,
				title: step.label || target.name || target.title
			}));
		case 'change':
			return updated(layout, step.key, (target) => ({
				...target,
				type: step.type ?? target.type,
				name: step.name ?? target.name,
				flags: step.flags ?? target.flags,
				label: step.label ?? target.label,
				title: step.label || step.name || target.title
			}));
	}
}

function inside(extended: Span | null, span: Span) {
	return Boolean(extended && span.offset >= extended.offset && end(span) <= end(extended));
}

function split(gap: Span, fences: number[]): Span[] {
	const cuts = [gap.offset, ...fences.filter((point) => point > gap.offset && point < end(gap)), end(gap)];
	return cuts.slice(1).map((stop, index) => ({ offset: cuts[index], size: stop - cuts[index] }));
}

export function gaps(layout: Layout): Span[] {
	const raw: Span[] = [];
	let cursor = layout.start;
	for (const candidate of layout.parts) {
		if (candidate.offset > cursor) raw.push({ offset: cursor, size: candidate.offset - cursor });
		cursor = Math.max(cursor, end(candidate));
	}
	if (layout.end > cursor) raw.push({ offset: cursor, size: layout.end - cursor });
	const fences = layout.extended ? [layout.extended.offset, end(layout.extended)] : [];
	return raw
		.flatMap((gap) => split(gap, fences))
		.map((gap) => ({ offset: alignUp(gap.offset), size: alignDown(end(gap)) - alignUp(gap.offset) }))
		.filter((gap) => gap.size >= MiB);
}

export function creatable(layout: Layout, gap: Span) {
	if (layout.table === 'gpt') return layout.parts.length < GPT_ENTRIES ? null : 'This drive’s partition table has no room for another partition.';
	if (inside(layout.extended, gap)) return null;
	const primaries = layout.parts.filter((candidate) => !candidate.logical).length + (layout.extended ? 1 : 0);
	return primaries < DOS_PRIMARIES ? null : 'An MBR partition table holds at most four partitions.';
}
