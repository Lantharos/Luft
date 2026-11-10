import { readJson, WriteQueue, writeJson } from '#lib/bridge/files.js';
import type { Heading, Notes, Said } from '#lib/bindings.js';
import type { RecordingEntry } from './model';

export interface Transcript {
	format: 1;
	said: Said[];
	next: number;
	transcribed: boolean;
	notes: {
		parts: Notes[];
		next: number;
		heading: Heading | null;
		done: boolean;
	};
}

export const emptyTranscript = (): Transcript => ({
	format: 1,
	said: [],
	next: 0,
	transcribed: false,
	notes: { parts: [], next: 0, heading: null, done: false }
});

const cache = new Map<string, Promise<Transcript>>();
const queues = new Map<string, WriteQueue>();

interface Folder {
	folder: string;
}

const pathOf = (notebook: Folder, recording: RecordingEntry) => `${notebook.folder}/recordings/${recording.id}.json`;

export function transcriptOf(notebook: Folder, recording: RecordingEntry): Promise<Transcript> {
	let kept = cache.get(recording.id);
	if (!kept) {
		kept = readJson<Transcript>(pathOf(notebook, recording)).then((stored) => stored ?? emptyTranscript());
		cache.set(recording.id, kept);
	}
	return kept;
}

export function saveTranscript(notebook: Folder, recording: RecordingEntry, transcript: Transcript) {
	const queue = queues.get(recording.id) ?? new WriteQueue();
	queues.set(recording.id, queue);
	const snapshot = structuredClone(transcript);
	return queue.run(() => writeJson(pathOf(notebook, recording), snapshot));
}
