import { t } from '@luft/i18n';
import { library, type NotebookEntry } from '#lib/library/library.svelte.js';
import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
import { appState } from './state';

/** Which notebook is open, and getting to one quickly when Heft starts. */
class Session {
	notebook: OpenNotebook | null = $state(null);

	async start() {
		const last = appState.get<string>('notebook');
		const all = library.subjects.flatMap((subject) => subject.notebooks);
		const entry = all.find((notebook) => notebook.meta.id === last) ?? all[0] ?? (await this.firstNotebook());
		this.open(entry);
	}

	private async firstNotebook(): Promise<NotebookEntry> {
		const subject = library.subjects[0] ?? (await library.createSubject(t('default-subject')));
		return library.createNotebook(subject, t('default-notebook'));
	}

	open(entry: NotebookEntry) {
		void this.notebook?.close();
		this.notebook = library.open(entry);
		void appState.save({ notebook: entry.meta.id });
	}

	close() {
		return this.notebook?.close();
	}
}

export const session = new Session();
