import { commands } from '#lib/bindings.js';
import type { Transcript } from './transcript';

const PART_LINES = 120;
const PART_LENGTH = 12 * 60_000;

type Step = { kind: 'done' } | { kind: 'notInstalled' } | { kind: 'paused' } | { kind: 'missing' };

/** How far the next part of the notes reaches: about twelve minutes of class, ending where a line ends. */
function partEnd(transcript: Transcript) {
	const { said } = transcript;
	const first = transcript.notes.next;
	let end = first;
	while (end < said.length && end - first < PART_LINES && said[end].start - said[first].start < PART_LENGTH) end++;
	return end;
}

/**
 * Writes the notes of the next part of a class, or, once every part has
 * notes, the class's title and summary. The transcript keeps where it got
 * to, so each part is written once.
 */
export async function writeNotes(transcript: Transcript, language: string): Promise<Step> {
	const { notes, said } = transcript;
	if (notes.next < said.length) {
		const end = partEnd(transcript);
		const lines = said.slice(notes.next, end).map((line) => ({ at: line.start, text: line.text }));
		const result = await commands.notesWrite({ language, lines });
		if (result.kind !== 'done') return result;
		notes.parts.push(result.written);
		notes.next = end;
		return result;
	}
	const points = notes.parts.flatMap((part) => part.points.map((point) => point.text));
	if (points.length) {
		const result = await commands.notesHeading({ language, points });
		if (result.kind !== 'done') return result;
		notes.heading = result.written;
	}
	notes.done = true;
	return { kind: 'done' };
}
