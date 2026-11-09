import { session } from '#lib/app/session.svelte.js';
import { readOutside } from '#lib/bridge/files.js';
import { library, type SubjectEntry } from './library.svelte';
import { pageSize, paperOf } from './model';
import { addPicture } from '#lib/objects/editing.svelte.js';

export const isPicture = (path: string) => /\.(png|jpe?g|webp|gif|avif)$/i.test(path);

export const pictureName = (path: string) => path.slice(path.lastIndexOf('/') + 1).replace(/\.[^.]+$/, '');

/** Makes a notebook in the subject with each picture on a page of its own, and opens it. */
export async function importPictures(subject: SubjectEntry, paths: string[]) {
	const pictures = paths.filter(isPicture);
	if (!pictures.length) return;
	const entry = await library.createNotebook(subject, pictureName(pictures[0]));
	const notebook = library.openNotebook(entry);
	for (const [index, path] of pictures.entries()) {
		const page = index ? notebook.addPage(index) : notebook.meta.pages[0];
		const store = await notebook.load(page.id);
		await addPicture(store.document, notebook.folder, pageSize(paperOf(notebook.meta, page), page), await readOutside(path), path);
	}
	await notebook.settle();
	session.open(entry);
}
