import { errorText } from '@luft/ui';
import { commands, events } from '#lib/bindings.js';
import { appState } from '#lib/app/state.js';
import { newId } from '#lib/ink/stroke.js';
import { library } from '#lib/library/library.svelte.js';
import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
import { power } from './power.svelte';
import { recordingsOf, type RecordingEntry } from './model';

const CONSENT = 'recordingConsent';
const TICK = 250;

/**
 * The class being recorded. The recording itself runs in Heft's native side,
 * so it goes on when the window closes; this follows it, keeps the notebook's
 * list of recordings and the pauses in it, and shows how long it's been.
 */
class Recorder {
	notebook: OpenNotebook | null = $state.raw(null);
	recording: RecordingEntry | null = $state(null);
	paused = $state(false);
	length = $state(0);
	level = $state(0);
	failure: string | null = $state(null);
	/** A recording that just stopped, to ask what to do with. */
	stopped: { notebook: OpenNotebook; recording: RecordingEntry } | null = $state(null);
	private ticker = 0;

	/** Whether the reminder to ask the teacher was shown for a subject, which has its own teacher. */
	asked(subject: string) {
		return appState.get<string[]>(CONSENT)?.includes(subject) ?? false;
	}

	agree(subject: string) {
		return appState.save({ [CONSENT]: [...(appState.get<string[]>(CONSENT) ?? []), subject] });
	}

	start() {
		const stops = [
			events.recordingLevel((level) => (this.level = level)),
			events.recordingFailed((error) => {
				this.failure = error;
				void this.stop();
			})
		];
		void this.follow();
		return () => stops.forEach((stop) => stop());
	}

	/** Picks up a recording that went on while the window was closed, and finishes ones a crash cut short. */
	private async follow() {
		const state = await commands.recordingState();
		for (const entry of library.notebooks) {
			for (const recording of recordingsOf(entry.meta)) {
				const path = `${entry.folder}/${recording.file}`;
				if (state?.path === path) {
					this.notebook = library.openNotebook(entry);
					this.recording = recording;
					this.paused = state.paused;
					this.length = state.length;
					if (!this.paused) this.tick();
				} else if (recording.length === undefined) {
					recording.length = await commands.recordingLength({ path });
					library.openNotebook(entry).changed();
				}
			}
		}
	}

	async record(notebook: OpenNotebook, page: string) {
		this.failure = null;
		const id = newId();
		const file = `recordings/${id}.opus`;
		try {
			await commands.recordingStart({ path: `${notebook.folder}/${file}` });
		} catch (error) {
			this.failure = errorText(error);
			return;
		}
		const recording: RecordingEntry = { id, file, page, spans: [{ at: Date.now(), from: 0 }], processing: power.defaultProcessing };
		notebook.meta.recordings = [...recordingsOf(notebook.meta), recording];
		this.notebook = notebook;
		this.recording = notebook.meta.recordings.at(-1)!;
		this.paused = false;
		this.length = 0;
		await notebook.save();
		this.tick();
	}

	private tick() {
		clearInterval(this.ticker);
		this.ticker = window.setInterval(() => {
			const span = this.recording?.spans.at(-1);
			if (span && !this.paused) this.length = span.from + Date.now() - span.at;
		}, TICK);
	}

	async pause() {
		this.length = await commands.recordingPause();
		this.paused = true;
		this.level = 0;
		clearInterval(this.ticker);
	}

	async resume() {
		const from = await commands.recordingResume();
		this.recording?.spans.push({ at: Date.now(), from });
		this.notebook?.changed();
		this.paused = false;
		this.tick();
	}

	async stop() {
		const { notebook, recording } = this;
		clearInterval(this.ticker);
		this.notebook = null;
		this.recording = null;
		this.level = 0;
		if (!notebook || !recording) return;
		recording.length = await commands.recordingStop().catch(() => commands.recordingLength({ path: `${notebook.folder}/${recording.file}` }));
		await notebook.save();
		this.stopped = { notebook, recording };
	}

	recordingIn(notebook: OpenNotebook) {
		return this.notebook === notebook ? this.recording : null;
	}
}

export const recorder = new Recorder();
