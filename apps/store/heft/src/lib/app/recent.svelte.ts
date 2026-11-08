import { appState } from './state';

export interface RecentPage {
	notebook: string;
	page: string;
	at: number;
}

const KEPT = 16;
const SAVE_AFTER = 1500;

/** The pages written on most recently, across every subject. */
class Recent {
	pages: RecentPage[] = $state([]);
	private timer = 0;

	load() {
		this.pages = appState.get<RecentPage[]>('recent') ?? [];
	}

	touch(notebook: string, page: string) {
		const first = this.pages[0];
		if (first?.notebook === notebook && first.page === page) {
			first.at = Date.now();
		} else {
			this.pages = [{ notebook, page, at: Date.now() }, ...this.pages.filter((item) => item.page !== page)].slice(0, KEPT);
		}
		clearTimeout(this.timer);
		this.timer = window.setTimeout(() => void appState.save({ recent: $state.snapshot(this.pages) }), SAVE_AFTER);
	}

	forget(notebook: string) {
		this.pages = this.pages.filter((item) => item.notebook !== notebook);
	}
}

export const recent = new Recent();
