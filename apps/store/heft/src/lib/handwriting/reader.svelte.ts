import { settings } from '#lib/app/settings.svelte.js';
import { commands, events, type HandwritingModel } from '#lib/bindings.js';
import { activity } from '#lib/input/activity.js';
import { pen } from '#lib/input/pen.svelte.js';
import { library, type NotebookEntry } from '#lib/library/library.svelte.js';
import { searchIndex } from '#lib/search/index.svelte.js';
import { inkPrint, writtenLines } from './lines';
import { readText, type InkLine } from './store';

const QUIET = 15_000;
const LOOK_AGAIN = 2_000;
const BATTERY_WAIT = 10 * 60_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Reads handwriting in the background so search finds it: page after page
 * whose ink changed, a line at a time, only once nobody has written for a
 * while, and never while the pen is near the screen.
 */
class Reader {
	model: HandwritingModel | null | undefined = $state(undefined);
	left = $state(0);
	waiting: 'writing' | 'battery' | null = $state(null);
	private running = false;

	get on() {
		return settings.values.handwriting && !!this.model?.installed;
	}

	start() {
		void this.refresh();
		return events.handwritingChanged(() => void this.refresh());
	}

	async refresh() {
		this.model = await commands.handwritingOverview();
		this.kick();
	}

	async download() {
		settings.set('handwriting', true);
		await commands.handwritingInstall();
	}

	async remove() {
		settings.set('handwriting', false);
		await commands.handwritingRemove();
	}

	/** Notes that a page's ink changed, to read it again once there's a pause. */
	touched(notebook: NotebookEntry, page: string) {
		if (!settings.values.handwriting) return;
		void readText.changed(notebook, page).then(() => this.kick());
	}

	private kick() {
		if (this.running || !this.on) return;
		this.running = true;
		void this.work().finally(() => (this.running = false));
	}

	private async work() {
		for (;;) {
			const queue = await this.queue();
			this.left = queue.length;
			if (!queue.length || !this.on) return;
			for (const [notebook, page] of queue) {
				if (!(await this.readPage(notebook, page)) || !this.on) return;
				this.left--;
			}
		}
	}

	private async queue() {
		const queue: [NotebookEntry, string][] = [];
		for (const notebook of library.notebooks) for (const page of await readText.unread(notebook)) queue.push([notebook, page]);
		return queue;
	}

	private async quiet() {
		while (activity.idleFor() < QUIET || pen.near) {
			this.waiting = 'writing';
			await sleep(LOOK_AGAIN);
		}
		this.waiting = null;
	}

	/** Reads one page; false when reading has to stop, such as when the model went away. */
	private async readPage(notebook: NotebookEntry, page: string): Promise<boolean> {
		const store = await library.openNotebook(notebook).load(page);
		const strokes = store.document.strokes;
		const ink = inkPrint(strokes);
		if (ink === (await readText.readWith(notebook, page))) {
			await readText.read(notebook, page, ink, (await readText.lines(notebook))[page] ?? []);
			return true;
		}
		const lines: InkLine[] = [];
		for (const line of writtenLines(strokes)) {
			await this.quiet();
			if (inkPrint(store.document.strokes) !== ink) return true;
			const read = await commands.handwritingRead({ strokes: line.strokes });
			if (read.kind === 'paused') {
				this.waiting = 'battery';
				await sleep(BATTERY_WAIT);
				this.waiting = null;
				return true;
			}
			if (read.kind !== 'text') return false;
			lines.push({ text: read.text, box: line.box });
		}
		await readText.read(notebook, page, ink, lines);
		searchIndex.setInk(notebook, page, lines);
		return true;
	}
}

export const reader = new Reader();
