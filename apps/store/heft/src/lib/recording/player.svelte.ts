import { readFile } from '#lib/bridge/files.js';
import type { Unwritten } from '#lib/canvas/ink-paint.js';
import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
import { clockAt, momentOf, recordingsOf, type RecordingEntry } from './model';

/** Writing comes a little after what's said, so playing from something written starts this much before it. */
const LEAD = 3000;
const FOLLOW_EVERY = 100;

/**
 * Plays a notebook's recordings. While a recording is open, what was written
 * after the moment playing shows faded until the recording reaches it, and
 * tapping writing plays what was said as it was written.
 */
class Player {
	notebook: OpenNotebook | null = $state.raw(null);
	recording: RecordingEntry | null = $state(null);
	playing = $state(false);
	position = $state(0);
	rate = $state(1);
	private readonly audio = new Audio();
	private url = '';
	private following = 0;
	private shown = 0;

	constructor() {
		this.audio.preload = 'auto';
		this.audio.addEventListener('play', () => {
			this.playing = true;
			this.follow();
		});
		this.audio.addEventListener('pause', () => (this.playing = false));
		this.audio.addEventListener('ended', () => (this.playing = false));
		this.audio.addEventListener('seeked', () => (this.position = this.audio.currentTime * 1000));
	}

	get length() {
		return this.recording?.length ?? 0;
	}

	openIn(notebook: OpenNotebook) {
		return this.notebook === notebook;
	}

	async open(notebook: OpenNotebook, recording: RecordingEntry) {
		if (this.recording === recording) return;
		this.close();
		const bytes = await readFile(`${notebook.folder}/${recording.file}`);
		this.url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'audio/ogg; codecs=opus' }));
		this.audio.src = this.url;
		this.audio.playbackRate = this.rate;
		this.notebook = notebook;
		this.recording = recording;
		this.position = 0;
	}

	async playFrom(notebook: OpenNotebook, id: string, offset: number) {
		const recording = recordingsOf(notebook.meta).find((candidate) => candidate.id === id);
		if (!recording) return;
		await this.open(notebook, recording);
		this.seek(offset);
		await this.audio.play();
	}

	/** Plays what was being said when something on the page was written, if a recording was going then. */
	playWritten(notebook: OpenNotebook, written: number) {
		const moment = momentOf(notebook.meta, written);
		if (!moment) return false;
		void this.playFrom(notebook, moment.recording.id, Math.max(0, moment.offset - LEAD));
		return true;
	}

	toggle() {
		if (this.audio.paused) void this.audio.play();
		else this.audio.pause();
	}

	seek(offset: number) {
		this.audio.currentTime = Math.min(this.length, Math.max(0, offset)) / 1000;
		this.position = this.audio.currentTime * 1000;
	}

	skip(by: number) {
		this.seek(this.position + by);
	}

	setRate(rate: number) {
		this.rate = rate;
		this.audio.playbackRate = rate;
	}

	close() {
		this.audio.pause();
		this.audio.removeAttribute('src');
		this.audio.load();
		URL.revokeObjectURL(this.url);
		cancelAnimationFrame(this.following);
		this.notebook = null;
		this.recording = null;
		this.playing = false;
	}

	private follow() {
		cancelAnimationFrame(this.following);
		const step = (now: number) => {
			if (!this.playing) return;
			if (now - this.shown >= FOLLOW_EVERY) {
				this.shown = now;
				this.position = this.audio.currentTime * 1000;
			}
			this.following = requestAnimationFrame(step);
		};
		this.following = requestAnimationFrame(step);
	}

	/** What hasn't been written yet at the moment playing, for the notebook it's playing in. */
	unwrittenIn(notebook: OpenNotebook): Unwritten | null {
		const recording = this.recording;
		if (this.notebook !== notebook || !recording?.length) return null;
		return { after: clockAt(recording, this.position), until: clockAt(recording, recording.length) };
	}
}

export const player = new Player();
