import { errorText } from '../text/errors';

export interface ToastAction {
	label: string;
	run: () => unknown;
}

export interface ToastDetail {
	title: string;
	text: string;
}

export interface ToastMessage {
	id: number;
	message: string;
	action?: ToastAction | null;
	detail?: ToastDetail | null;
	failed?: boolean;
	busy?: boolean;
	lasting?: boolean;
}

interface ShowOptions {
	action?: ToastAction | null;
	detail?: ToastDetail | null;
	failed?: boolean;
	busy?: boolean;
	duration?: number | null;
}

const SHOWN_MS = 5000;
const AFTER_HOVER_MS = 2000;

export class Toasts {
	current = $state.raw<ToastMessage | null>(null);

	#timer: ReturnType<typeof setTimeout> | undefined;
	#next = 0;
	#held = false;

	constructor(private readonly shownMs = SHOWN_MS) {}

	show(message: string, { action = null, detail = null, failed = false, busy = false, duration = this.shownMs }: ShowOptions = {}) {
		clearTimeout(this.#timer);
		this.current = { id: ++this.#next, message, action, detail, failed, busy, lasting: duration === null };
		if (!this.#held && duration !== null) this.#timer = setTimeout(this.dismiss, duration);
	}

	run = () => {
		const action = this.current?.action;
		this.dismiss();
		void action?.run();
	};

	fail = (error: unknown) => this.show(errorText(error), { failed: true });

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
		if (this.current && !this.current.lasting) this.#timer = setTimeout(this.dismiss, AFTER_HOVER_MS);
	};
}
