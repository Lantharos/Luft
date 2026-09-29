import * as api from './api';
import type { HistoryState, NoticeKind } from './types';

const TOAST_MS = 6000;

export interface Toast {
	id: number;
	kind: NoticeKind;
	message: string;
}

class History {
	canUndo = $state(false);
	canRedo = $state(false);
	toast = $state<Toast | null>(null);

	#timer: ReturnType<typeof setTimeout> | undefined;
	#next = 0;

	receive = (state: HistoryState) => {
		this.canUndo = state.canUndo;
		this.canRedo = state.canRedo;
		if (state.notice) this.#show(state.notice.kind, state.notice.message);
	};

	undo = () => {
		if (this.canUndo) void api.undo();
	};

	redo = () => {
		if (this.canRedo) void api.redo();
	};

	dismiss = () => {
		clearTimeout(this.#timer);
		this.toast = null;
	};

	hold = () => clearTimeout(this.#timer);

	release = () => {
		clearTimeout(this.#timer);
		this.#timer = setTimeout(this.dismiss, TOAST_MS);
	};

	#show(kind: NoticeKind, message: string) {
		this.toast = { id: ++this.#next, kind, message };
		this.release();
	}
}

export const history = new History();
