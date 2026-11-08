import type { NotebookMeta } from '#lib/library/model.js';

/** When recording went on after a pause: at `at` on the clock, `from` milliseconds into the recording. */
export interface Span {
	at: number;
	from: number;
}

/** What a recording waits for before it's transcribed and turned into notes. */
export type Processing = 'now' | 'charger';

/** A class recorded in a notebook, listed in its notebook.json. */
export interface RecordingEntry {
	id: string;
	/** Where it's kept in the notebook's folder, `recordings/<id>.opus`. */
	file: string;
	/** The page in view when recording started. */
	page: string;
	spans: Span[];
	/** How long it is in milliseconds, once it's stopped. */
	length?: number;
	processing: Processing;
}

export const recordingsOf = (meta: NotebookMeta): RecordingEntry[] => meta.recordings ?? [];

/** Where in the recording something written at `time` on the clock was said, or null if not while recording. */
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

/** When on the clock the moment `offset` milliseconds into the recording was recorded. */
export function clockAt(recording: RecordingEntry, offset: number): number {
	let found = recording.spans[0];
	for (const span of recording.spans) if (span.from <= offset) found = span;
	return found.at + offset - found.from;
}

/** The recording that was going when something was written, with where in it. */
export function momentOf(meta: NotebookMeta, time: number): { recording: RecordingEntry; offset: number } | null {
	for (const recording of recordingsOf(meta)) {
		const offset = audioAt(recording, time);
		if (offset !== null) return { recording, offset };
	}
	return null;
}
