import { t } from '@luft/i18n';
import { session } from '#lib/app/session.svelte.js';
import { commands } from '#lib/bindings.js';
import { library, type SubjectEntry } from '#lib/library/library.svelte.js';
import { DEFAULT_PAPER } from '#lib/library/model.js';
import { bookName, pdfPages } from './sources';

export const choosePdfs = () => commands.chooseFiles({ kind: 'pdf', title: t('book-choose-title'), filter: t('book-choose-filter') });

export const isPdf = (path: string) => /\.pdf$/i.test(path);

/** Makes a book in the subject from each PDF, and opens the last one. */
export async function importBooks(subject: SubjectEntry, paths: string[]) {
	for (const path of paths.filter(isPdf)) {
		const book = await library.createNotebook(subject, bookName(path), DEFAULT_PAPER, (folder) => pdfPages(folder, path));
		session.open(book);
	}
}
