import { t } from '@luft/i18n';
import { library, type NotebookEntry } from '#lib/library/library.svelte.js';
import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
import { recent } from './recent.svelte';
import { appState } from './state';

const MAX_TABS = 6;

class Session {
	tabs: OpenNotebook[] = $state([]);
	current: OpenNotebook | null = $state(null);
	beside: OpenNotebook | null = $state(null);
	goTo: { notebook: string; page: string } | null = $state(null);

	async start() {
		const saved = appState.get<{ tabs: string[]; current: string | null }>('tabs');
		for (const id of saved?.tabs ?? []) {
			const entry = library.notebook(id);
			if (entry) this.tabs.push(library.openNotebook(entry));
		}
		const current = saved?.current ? this.tabs.find((tab) => tab.meta.id === saved.current) : null;
		if (current) this.show(current);
		else if (!library.notebooks.length) this.open(await this.firstNotebook());
	}

	private async firstNotebook(): Promise<NotebookEntry> {
		const subject = library.subjects[0] ?? (await library.createSubject(t('default-subject')));
		return library.createNotebook(subject, t('default-notebook'));
	}

	open(entry: NotebookEntry, page?: string) {
		let tab = this.tabs.find((candidate) => candidate.meta.id === entry.meta.id);
		if (!tab) {
			tab = library.openNotebook(entry);
			if (this.tabs.length >= MAX_TABS) {
				const oldest = this.tabs.find((candidate) => candidate !== this.current)!;
				this.close(oldest);
			}
			this.tabs.push(tab);
		}
		this.goTo = page ? { notebook: entry.meta.id, page } : null;
		this.show(tab);
	}

	show(tab: OpenNotebook) {
		this.current = tab;
		this.beside = this.rememberedBeside(tab);
		this.remember();
	}

	private rememberedBeside(tab: OpenNotebook): OpenNotebook | null {
		const pair = appState.get<Record<string, string[]>>('splits')?.[tab.meta.subject];
		const other = pair?.includes(tab.meta.id) ? pair.find((id) => id !== tab.meta.id) : undefined;
		const entry = other ? library.notebook(other) : undefined;
		return entry ? library.openNotebook(entry) : null;
	}

	split(entry: NotebookEntry) {
		if (!this.current || entry.meta.id === this.current.meta.id) return;
		this.beside = library.openNotebook(entry);
		const splits = appState.get<Record<string, string[]>>('splits') ?? {};
		void appState.save({ splits: { ...splits, [this.current.meta.subject]: [this.current.meta.id, entry.meta.id] } });
	}

	unsplit() {
		if (!this.current) return;
		this.beside = null;
		const splits = { ...appState.get<Record<string, string[]>>('splits') };
		delete splits[this.current.meta.subject];
		void appState.save({ splits });
	}

	home() {
		this.current = null;
		this.remember();
	}

	close(tab: OpenNotebook) {
		void tab.settle();
		const index = this.tabs.indexOf(tab);
		this.tabs.splice(index, 1);
		const next = this.tabs[Math.min(index, this.tabs.length - 1)];
		if (this.beside === tab) this.beside = null;
		if (this.current !== tab) this.remember();
		else if (next) this.show(next);
		else this.home();
	}

	prune() {
		for (const tab of [...this.tabs]) {
			if (!library.notebook(tab.meta.id)) {
				recent.forget(tab.meta.id);
				this.close(tab);
			}
		}
	}

	newPageIn(subjectId: string) {
		const subject = library.subject(subjectId);
		const notebook = subject?.notebooks.filter((entry) => entry.meta.kind === 'notes').sort((a, b) => b.meta.modified - a.meta.modified)[0];
		if (!notebook) return;
		const open = library.openNotebook(notebook);
		const page = open.addPage(open.meta.pages.length);
		this.open(notebook, page.id);
	}

	settle() {
		return Promise.all(this.tabs.map((tab) => tab.settle()));
	}

	private remember() {
		void appState.save({ tabs: { tabs: this.tabs.map((tab) => tab.meta.id), current: this.current?.meta.id ?? null } });
	}
}

export const session = new Session();
