interface ToastAction {
	label: string;
	run: () => void;
}

export interface Toast {
	id: number;
	message: string;
	action: ToastAction | null;
	failed: boolean;
}

const DURATION = 5000;

class Toasts {
	current = $state<Toast | null>(null);
	private timer: ReturnType<typeof setTimeout> | undefined;
	private next = 0;
	private held = false;
	private remaining = DURATION;

	show(message: string, options: { action?: ToastAction; duration?: number; failed?: boolean } = {}) {
		clearTimeout(this.timer);
		this.current = { id: ++this.next, message, action: options.action ?? null, failed: options.failed ?? false };
		this.remaining = options.duration ?? DURATION;
		if (!this.held) this.timer = setTimeout(this.dismiss, this.remaining);
	}

	fail(error: unknown) {
		this.show(error instanceof Error ? error.message : String(error), { failed: true });
	}

	run = () => {
		const action = this.current?.action;
		this.dismiss();
		action?.run();
	};

	dismiss = () => {
		clearTimeout(this.timer);
		this.current = null;
	};

	hold = () => {
		this.held = true;
		clearTimeout(this.timer);
	};

	release = () => {
		this.held = false;
		if (this.current) this.timer = setTimeout(this.dismiss, 2000);
	};
}

export const toasts = new Toasts();
