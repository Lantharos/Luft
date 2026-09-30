const VISIBLE_MS = 5000;

export interface Notice {
	id: number;
	message: string;
}

class NoticeStore {
	current = $state<Notice | null>(null);
	#timer: ReturnType<typeof setTimeout> | undefined;
	#next = 0;

	show(message: string) {
		clearTimeout(this.#timer);
		this.current = { id: ++this.#next, message };
		this.#timer = setTimeout(() => this.dismiss(), VISIBLE_MS);
	}

	fail(error: unknown) {
		this.show(error instanceof Error ? error.message : String(error));
	}

	dismiss() {
		clearTimeout(this.#timer);
		this.current = null;
	}
}

export const notices = new NoticeStore();
