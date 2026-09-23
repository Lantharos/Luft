const SKELETON_DELAY_MS = 240;

export class DelayedLoading {
	active = $state(false);
	skeleton = $state(false);
	#timer: ReturnType<typeof setTimeout> | null = null;
	#token = 0;

	start() {
		const token = ++this.#token;
		this.active = true;
		this.skeleton = false;
		this.#clearTimer();
		this.#timer = setTimeout(() => {
			if (this.active && this.#token === token) this.skeleton = true;
		}, SKELETON_DELAY_MS);
		return token;
	}

	isCurrent(token: number) {
		return this.#token === token;
	}

	finish(token: number) {
		if (!this.isCurrent(token)) return false;
		this.active = false;
		this.skeleton = false;
		this.#clearTimer();
		return true;
	}

	cancel() {
		this.#token += 1;
		this.active = false;
		this.skeleton = false;
		this.#clearTimer();
	}

	#clearTimer() {
		if (!this.#timer) return;
		clearTimeout(this.#timer);
		this.#timer = null;
	}
}
