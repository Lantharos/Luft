const STAGGER_WINDOW_MS = 120;
const REORDER_WINDOW_MS = 320;

export class ListMotion {
	stagger = $state(false);
	reordering = $state(false);
	#staggerTimer: ReturnType<typeof setTimeout> | undefined;
	#reorderTimer: ReturnType<typeof setTimeout> | undefined;

	enter() {
		this.#settle();
		this.stagger = true;
		this.#staggerTimer = setTimeout(() => (this.stagger = false), STAGGER_WINDOW_MS);
	}

	reorder() {
		clearTimeout(this.#reorderTimer);
		this.reordering = true;
		this.#reorderTimer = setTimeout(() => (this.reordering = false), REORDER_WINDOW_MS);
	}

	#settle() {
		clearTimeout(this.#staggerTimer);
		clearTimeout(this.#reorderTimer);
		this.reordering = false;
	}
}
