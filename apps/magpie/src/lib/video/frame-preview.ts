const WIDTH = 176;

export class FramePreview {
	readonly canvas = document.createElement('canvas');
	#video: HTMLVideoElement | null = null;
	#source: string;
	#wanted: number | null = null;
	#seeking = false;

	constructor(source: string) {
		this.#source = source;
		this.canvas.width = WIDTH;
		this.canvas.height = Math.round((WIDTH * 9) / 16);
	}

	request(time: number) {
		this.#wanted = time;
		if (!this.#seeking) this.#seek();
	}

	destroy() {
		this.#video?.removeAttribute('src');
		this.#video?.load();
		this.#video = null;
	}

	#seek() {
		const video = this.#ensureVideo();
		if (this.#wanted === null || video.readyState < HTMLMediaElement.HAVE_METADATA) return;
		this.#seeking = true;
		video.currentTime = this.#wanted;
		this.#wanted = null;
	}

	#ensureVideo() {
		if (this.#video) return this.#video;
		const video = document.createElement('video');
		video.muted = true;
		video.preload = 'auto';
		video.src = this.#source;
		video.addEventListener('loadedmetadata', () => {
			this.canvas.height = Math.round((WIDTH * video.videoHeight) / Math.max(1, video.videoWidth));
			this.#seek();
		});
		video.addEventListener('seeked', () => {
			this.canvas.getContext('2d')?.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
			this.#seeking = false;
			if (this.#wanted !== null) this.#seek();
		});
		this.#video = video;
		return video;
	}
}
