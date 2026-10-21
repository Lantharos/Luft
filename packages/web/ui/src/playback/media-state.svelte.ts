import type { NativeVideo, NativeVideoEvent } from '@lantharos/sabine';

const EVENTS: NativeVideoEvent[] = ['play', 'pause', 'playing', 'timeupdate', 'seeked', 'durationchange', 'loadedmetadata', 'volumechange', 'ended', 'resize'];

/** Reactive playback state of a native video, for binding to media controls. */
export class MediaState {
	paused = $state(true);
	currentTime = $state(0);
	duration = $state(0);
	muted = $state(false);
	volume = $state(1);
	width = $state(0);
	height = $state(0);

	#video: NativeVideo;

	constructor(video: NativeVideo) {
		this.#video = video;
		for (const name of EVENTS) video.addEventListener(name, this.#sync);
		this.#sync();
	}

	setPaused(paused: boolean) {
		if (paused) this.#video.pause();
		else void this.#video.play();
		this.paused = paused;
	}

	seek(time: number) {
		this.#video.currentTime = time;
		this.currentTime = time;
	}

	setMuted(muted: boolean) {
		this.#video.muted = muted;
	}

	setVolume(volume: number) {
		this.#video.volume = volume;
	}

	destroy() {
		for (const name of EVENTS) this.#video.removeEventListener(name, this.#sync);
	}

	#sync = () => {
		const video = this.#video;
		this.paused = video.paused;
		this.currentTime = video.currentTime;
		this.duration = Number.isFinite(video.duration) ? video.duration : 0;
		this.muted = video.muted;
		this.volume = video.volume;
		this.width = video.videoWidth;
		this.height = video.videoHeight;
	};
}
