const SHOWN_MS = 3200;

class Toast {
	current = $state<{ id: number; text: string } | null>(null);

	#timer: ReturnType<typeof setTimeout> | undefined;

	show(text: string) {
		clearTimeout(this.#timer);
		this.current = { id: (this.current?.id ?? 0) + 1, text };
		this.#timer = setTimeout(() => (this.current = null), SHOWN_MS);
	}

	failed(error: unknown) {
		this.show(error instanceof Error ? error.message : String(error));
	}
}

export const toast = new Toast();
