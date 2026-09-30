import type { Cue } from '$lib/api';

const TIMING = /(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})\s*-->\s*(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})/;
const MARKUP = /<[^>]+>|\{\\[^}]*\}/g;

function seconds(hours: string | undefined, minutes: string, secs: string, fraction: string) {
	return Number(hours ?? 0) * 3600 + Number(minutes) * 60 + Number(secs) + Number(fraction.padEnd(3, '0')) / 1000;
}

export function plainCues(cues: Cue[]) {
	return cues.map((cue) => ({ ...cue, text: cue.text.replace(MARKUP, '').trim() }));
}

export function parseSubtitles(text: string): Cue[] {
	const cues: Cue[] = [];
	for (const block of text.replace(/\r/g, '').split(/\n{2,}/)) {
		const lines = block.split('\n');
		const timingAt = lines.findIndex((line) => TIMING.test(line));
		if (timingAt < 0) continue;
		const match = TIMING.exec(lines[timingAt])!;
		const body = lines
			.slice(timingAt + 1)
			.join('\n')
			.replace(MARKUP, '')
			.trim();
		if (!body) continue;
		cues.push({
			start: seconds(match[1], match[2], match[3], match[4]),
			end: seconds(match[5], match[6], match[7], match[8]),
			text: body
		});
	}
	return cues.sort((a, b) => a.start - b.start);
}

/** A media element or native video the cues follow. */
type Timeline = Pick<HTMLMediaElement, 'currentTime' | 'paused' | 'playbackRate'> & EventTarget;

export class CueClock {
	text = $state('');
	#cues: Cue[] = [];
	#media: Timeline | null = null;
	#timer: ReturnType<typeof setTimeout> | undefined;

	attach(media: Timeline, cues: Cue[]) {
		this.detach();
		this.#media = media;
		this.#cues = cues;
		for (const event of ['play', 'pause', 'seeked', 'ratechange', 'playing', 'waiting']) media.addEventListener(event, this.sync);
		this.sync();
	}

	detach() {
		clearTimeout(this.#timer);
		for (const event of ['play', 'pause', 'seeked', 'ratechange', 'playing', 'waiting']) this.#media?.removeEventListener(event, this.sync);
		this.#media = null;
		this.#cues = [];
		this.text = '';
	}

	sync = () => {
		clearTimeout(this.#timer);
		const media = this.#media;
		if (!media) return;
		const now = media.currentTime;
		const active = this.#cues.filter((cue) => cue.start <= now && now < cue.end);
		this.text = active.map((cue) => cue.text).join('\n');
		if (media.paused) return;
		const boundaries = this.#cues.flatMap((cue) => [cue.start, cue.end]).filter((time) => time > now);
		const next = boundaries.length ? Math.min(...boundaries) : null;
		if (next !== null) this.#timer = setTimeout(this.sync, ((next - now) / media.playbackRate) * 1000 + 8);
	};
}
