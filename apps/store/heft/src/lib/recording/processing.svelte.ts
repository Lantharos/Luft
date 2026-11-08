import { SvelteMap } from 'svelte/reactivity';
import { commands, events, type LanguageModel, type Model } from '#lib/bindings.js';
import { activity } from '#lib/input/activity.js';
import { pen } from '#lib/input/pen.svelte.js';
import { library } from '#lib/library/library.svelte.js';
import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
import { searchIndex } from '#lib/search/index.svelte.js';
import { classLanguages, notesLanguage } from './languages';
import { recordingsOf, type RecordingEntry } from './model';
import { writeNotes } from './notes';
import { power } from './power.svelte';
import { recorder } from './recorder.svelte';
import { saveTranscript, transcriptOf, type Transcript } from './transcript';

const QUIET = 15_000;
const LOOK_AGAIN = 2_000;
const BATTERY_WAIT = 10 * 60_000;
const CATCH_UP_AFTER = 60_000;

/** What to do after working on a recording: go on to the next, come back to it later, or stop. */
type Outcome = 'next' | 'later' | 'stop';

export type Stage =
	| { kind: 'waiting'; for: 'charger' | 'writing' | 'battery' | 'models' | 'recording' }
	| { kind: 'transcribing' | 'writing-notes'; share: number }
	| { kind: 'done' }
	| { kind: 'unsupported' | 'missing' }
	| { kind: 'failed'; error: string };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Turns recordings into transcripts and notes in the background, one at a
 * time: only while nobody writes, never while the pen is near, and for a
 * recording that waits for the charger only once it's plugged in. Both steps
 * keep where they got to after every piece, so they go on from there.
 */
class Processing {
	whisper: Model | null | undefined = $state(undefined);
	writer: LanguageModel | null | undefined = $state(undefined);
	readonly stages = new SvelteMap<string, Stage>();
	/** Goes up whenever a transcript or its notes grow, for whatever shows them. */
	revision = $state(0);
	private running = false;
	private wake: (() => void) | null = null;
	private readonly resting = new Set<string>();

	start() {
		const stops = [
			events.speechChanged(() => void this.refresh()),
			events.languageChanged(() => void this.refresh()),
			events.powerBattery(() => this.kick())
		];
		void this.refresh();
		return () => stops.forEach((stop) => stop());
	}

	get ready() {
		return !!this.whisper?.installed && !!this.writer?.installed;
	}

	async refresh() {
		[this.whisper, this.writer] = await Promise.all([commands.whisperOverview(), commands.notesOverview()]);
		this.kick();
	}

	/** Downloads what transcribing and writing notes need. */
	async download() {
		if (this.whisper && !this.whisper.installed) await commands.whisperInstall({ id: this.whisper.id });
		if (this.writer && !this.writer.installed) await commands.notesInstall();
	}

	/** Has a recording processed now, or once the charger is in. */
	choose(notebook: OpenNotebook, recording: RecordingEntry, processing: RecordingEntry['processing']) {
		recording.processing = processing;
		notebook.changed();
		this.kick();
	}

	stage(recording: RecordingEntry): Stage | undefined {
		return this.stages.get(recording.id);
	}

	kick() {
		this.wake?.();
		if (this.running) return;
		this.running = true;
		void this.work().finally(() => (this.running = false));
	}

	private async work() {
		for (;;) {
			const next = await this.next();
			if (!next) return;
			const [notebook, recording, transcript] = next;
			const outcome = await this.process(notebook, recording, transcript);
			if (outcome === 'stop') return;
			if (outcome === 'later') this.rest(recording, CATCH_UP_AFTER);
		}
	}

	private async next(): Promise<[OpenNotebook, RecordingEntry, Transcript] | null> {
		for (const entry of library.notebooks) {
			for (const recording of recordingsOf(entry.meta)) {
				if (this.resting.has(recording.id)) continue;
				const notebook = library.openNotebook(entry);
				const transcript = await transcriptOf(notebook, recording);
				if (transcript.notes.done) this.stages.set(recording.id, { kind: 'done' });
				else return [notebook, recording, transcript];
			}
		}
		return null;
	}

	/** Leaves a recording alone for a while, or until Heft starts again when there's no `after`. */
	private rest(recording: RecordingEntry, after?: number) {
		this.resting.add(recording.id);
		if (after)
			setTimeout(() => {
				this.resting.delete(recording.id);
				this.kick();
			}, after);
	}

	/** Waits until the recording may be worked on; false when nothing can happen until something changes. */
	private async allowed(recording: RecordingEntry): Promise<boolean> {
		if (!this.ready) {
			this.stages.set(recording.id, { kind: 'waiting', for: 'models' });
			return false;
		}
		if (recording.processing === 'charger' && power.onBattery) {
			this.stages.set(recording.id, { kind: 'waiting', for: 'charger' });
			await power.charger();
		}
		while (activity.idleFor() < QUIET || pen.near) {
			this.stages.set(recording.id, { kind: 'waiting', for: 'writing' });
			await sleep(LOOK_AGAIN);
		}
		return true;
	}

	private async pauseForBattery(recording: RecordingEntry) {
		this.stages.set(recording.id, { kind: 'waiting', for: 'battery' });
		await Promise.race([sleep(BATTERY_WAIT), new Promise<void>((resolve) => (this.wake = resolve))]);
		this.wake = null;
	}

	/** Works on one recording until it's done, or until it has to wait. */
	private async process(notebook: OpenNotebook, recording: RecordingEntry, transcript: Transcript): Promise<Outcome> {
		const subject = library.subjectOf(notebook.entry)?.meta;
		const languages = classLanguages(subject);
		const path = `${notebook.folder}/${recording.file}`;
		while (!transcript.transcribed) {
			if (!(await this.allowed(recording))) return 'stop';
			const ended = recording.length !== undefined;
			if (!ended && recorder.recordingIn(notebook) !== recording) return 'later';
			this.stages.set(recording.id, { kind: 'transcribing', share: recording.length ? transcript.next / recording.length : 0 });
			const result = await commands.transcribe({ path, from: transcript.next, ended, languages }).catch((error) => ({ kind: 'failed' as const, error: String(error) }));
			if (result.kind === 'paused') await this.pauseForBattery(recording);
			else if (result.kind === 'done') {
				transcript.said.push(...result.transcribed.said);
				const advanced = result.transcribed.next > transcript.next || result.transcribed.done;
				transcript.next = result.transcribed.next;
				transcript.transcribed = result.transcribed.done;
				await saveTranscript(notebook, recording, transcript);
				this.revision++;
				searchIndex.setSaid(notebook.entry, recording, transcript.said);
				if (!advanced) {
					this.stages.set(recording.id, { kind: 'waiting', for: 'recording' });
					return 'later';
				}
			} else return this.stop(recording, result);
		}
		while (!transcript.notes.done) {
			if (!(await this.allowed(recording))) return 'stop';
			this.stages.set(recording.id, { kind: 'writing-notes', share: transcript.said.length ? transcript.notes.next / transcript.said.length : 1 });
			const result = await writeNotes(transcript, notesLanguage(transcript, subject)).catch((error) => ({ kind: 'failed' as const, error: String(error) }));
			if (result.kind === 'paused') await this.pauseForBattery(recording);
			else if (result.kind === 'done') {
				await saveTranscript(notebook, recording, transcript);
				this.revision++;
			}
			else return this.stop(recording, result);
		}
		this.stages.set(recording.id, { kind: 'done' });
		return 'next';
	}

	private stop(recording: RecordingEntry, result: { kind: 'notInstalled' } | { kind: 'unsupported' } | { kind: 'missing' } | { kind: 'failed'; error: string }): Outcome {
		if (result.kind === 'notInstalled') {
			this.stages.set(recording.id, { kind: 'waiting', for: 'models' });
			void this.refresh();
			return 'stop';
		}
		this.stages.set(recording.id, result);
		this.rest(recording);
		return result.kind === 'failed' ? 'next' : 'stop';
	}
}

export const processing = new Processing();
