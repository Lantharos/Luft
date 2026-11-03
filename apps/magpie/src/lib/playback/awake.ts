class ScreenAwake {
	#wanted = false;
	#lock: Promise<WakeLockSentinel> | null = null;

	constructor() {
		document.addEventListener('visibilitychange', () => this.#acquire());
	}

	keep(wanted: boolean) {
		this.#wanted = wanted;
		if (wanted) this.#acquire();
		else void this.#lock?.then((lock) => lock.release());
	}

	#acquire() {
		if (!this.#wanted || this.#lock || document.hidden) return;
		this.#lock = navigator.wakeLock.request('screen');
		this.#lock.then(
			(lock) => lock.addEventListener('release', () => this.#released()),
			() => (this.#lock = null)
		);
	}

	#released() {
		this.#lock = null;
		this.#acquire();
	}
}

export const screenAwake = new ScreenAwake();
