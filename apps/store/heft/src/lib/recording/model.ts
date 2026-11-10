import type { NotebookMeta } from '#lib/library/model.js';

export interface Span {
	at: number;
	from: number;
}

export type Processing = 'now' | 'charger';

export interface RecordingEntry {
	id: string;
	file: string;
	page: string;
	spans: Span[];
	length?: number;
	processing: Processing;
}

export const recordingsOf = (meta: NotebookMeta): RecordingEntry[] => meta.recordings ?? [];

export function audioAt(recording: RecordingEntry, time: number): number | null {
	const spans = recording.spans;
	if (!spans.length || time < spans[0].at) return null;
	for (let index = spans.length - 1; index >= 0; index--) {
		const span = spans[index];
		if (time < span.at) continue;
		const end = spans[index + 1]?.from ?? recording.length ?? Infinity;
		const offset = span.from + time - span.at;
		return offset <= end ? offset : index === spans.length - 1 ? null : end;
	}
	return null;
}

export function clockAt(recording: RecordingEntry, offset: number): number {
	let found = recording.spans[0];
	for (const span of recording.spans) if (span.from <= offset) found = span;
	return found.at + offset - found.from;
}

export function momentOf(meta: NotebookMeta, time: number): { recording: RecordingEntry; offset: number } | null {
	for (const recording of recordingsOf(meta)) {
		const offset = audioAt(recording, time);
		if (offset !== null) return { recording, offset };
	}
	return null;
}
