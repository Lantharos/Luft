export interface ToastAction {
	label: string;
	run: () => unknown;
}

export interface ToastMessage {
	id: number;
	message: string;
	action?: ToastAction | null;
	failed?: boolean;
}

interface ShowOptions {
	action?: ToastAction | null;
	failed?: boolean;
	duration?: number;
}

const SHOWN_MS = 5000;
const AFTER_HOVER_MS = 2000;

/** One toast at a time: a newer one replaces the one on screen. */
export class Toasts {
	current = $state.raw<ToastMessage | null>(null);

	#timer: ReturnType<typeof setTimeout> | undefined;
	#next = 0;
	#held = false;

	constructor(private readonly shownMs = SHOWN_MS) {}

	show(message: string, { action = null, failed = false, duration = this.shownMs }: ShowOptions = {}) {
		clearTimeout(this.#timer);
		this.current = { id: ++this.#next, message, action, failed };
		if (!this.#held) this.#timer = setTimeout(this.dismiss, duration);
	}

	run = () => {
		const action = this.current?.action;
		this.dismiss();
		void action?.run();
	};

	fail = (error: unknown) => this.show(error instanceof Error ? error.message : String(error), { failed: true });

	dismiss = () => {
		clearTimeout(this.#timer);
		this.#held = false;
		this.current = null;
	};

	hold = () => {
		this.#held = true;
		clearTimeout(this.#timer);
	};

	release = () => {
		this.#held = false;
		if (this.current) this.#timer = setTimeout(this.dismiss, AFTER_HOVER_MS);
	};
}
