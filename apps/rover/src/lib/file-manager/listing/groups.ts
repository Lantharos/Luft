import { month } from '@luft/ui';
import type { FileEntry, GroupBy } from '#lib/types/index.js';
import { fileKind, type FileKind } from '#lib/utils/kinds.js';

export type Section = { key: string; label: string; count: number };
export type Grouped = { entries: FileEntry[]; sections: Section[] | null };

type Bucket = { key: string; label: string; rank: number; entries: FileEntry[] };

const DAY_MS = 86_400_000;
const KINDS: [FileKind, string][] = [
	['folder', 'Folders'],
	['document', 'Documents'],
	['image', 'Images'],
	['video', 'Videos'],
	['audio', 'Audio'],
	['code', 'Text and code'],
	['archive', 'Archives'],
	['package', 'Apps and packages'],
	['file', 'Other']
];
const KIND_RANK = new Map(KINDS.map(([kind], index) => [kind, index]));
const KIND_LABEL = new Map(KINDS);

export function groupEntries(entries: FileEntry[], groupBy: GroupBy, oldestFirst: boolean): Grouped {
	if (groupBy === 'none') return { entries, sections: null };
	const place = groupBy === 'kind' ? kindBucket : dateBucket(oldestFirst);
	const buckets = new Map<string, Bucket>();
	for (const entry of entries) {
		const { key, label, rank } = place(entry);
		let bucket = buckets.get(key);
		if (!bucket) buckets.set(key, (bucket = { key, label, rank, entries: [] }));
		bucket.entries.push(entry);
	}
	const ordered = [...buckets.values()].sort((a, b) => a.rank - b.rank);
	return {
		entries: ordered.flatMap((bucket) => bucket.entries),
		sections: ordered.map(({ key, label, entries }) => ({ key, label, count: entries.length }))
	};
}

function kindBucket(entry: FileEntry) {
	const kind = fileKind(entry);
	return { key: kind, label: KIND_LABEL.get(kind)!, rank: KIND_RANK.get(kind)! };
}

function dateBucket(oldestFirst: boolean) {
	const now = new Date();
	const today = new Date(now).setHours(0, 0, 0, 0);
	const thisYear = now.getFullYear();
	const direction = oldestFirst ? 1 : -1;
	const recent: [number, string, string][] = [
		[today, 'today', 'Today'],
		[today - DAY_MS, 'yesterday', 'Yesterday'],
		[today - 7 * DAY_MS, 'week', 'Previous 7 days'],
		[today - 30 * DAY_MS, 'month', 'Previous 30 days']
	];
	return (entry: FileEntry) => {
		if (entry.modified === null) return { key: 'unknown', label: 'No date', rank: Infinity };
		const time = entry.modified * 1000;
		const recently = recent.find(([start]) => time >= start);
		if (recently) return { key: recently[1], label: recently[2], rank: recently[0] * direction };
		const date = new Date(time);
		const year = date.getFullYear();
		if (year === thisYear) {
			const start = new Date(year, date.getMonth(), 1).getTime();
			return { key: `month-${date.getMonth()}`, label: month(entry.modified), rank: start * direction };
		}
		return { key: `year-${year}`, label: String(year), rank: new Date(year, 0, 1).getTime() * direction };
	};
}
