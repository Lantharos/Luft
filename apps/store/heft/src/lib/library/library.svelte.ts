import { writeJson } from '#lib/bridge/files.js';
import { commands } from '#lib/bindings.js';
import { newId } from '#lib/ink/stroke.js';
import { DEFAULT_PAPER, FORMAT, type NotebookMeta, type Paper, type SubjectMeta } from './model';
import { OpenNotebook } from './notebook.svelte';

export interface NotebookEntry {
	folder: string;
	meta: NotebookMeta;
}

export interface SubjectEntry {
	folder: string;
	meta: SubjectMeta;
	notebooks: NotebookEntry[];
}

export const SUBJECT_COLORS = ['#3d6fb6', '#c2453d', '#3f8a5a', '#b7791f', '#7a4fa8', '#2f8a8a', '#c25a87', '#5b6470'];

function folderName(name: string): string {
	const cleaned = name.replace(/[/\\:*?"<>|\u0000-\u001f]/g, ' ').replace(/^\.+/, '').trim();
	return cleaned || 'Untitled';
}

function unique(name: string, taken: string[]): string {
	if (!taken.includes(name)) return name;
	for (let index = 2; ; index++) {
		const candidate = `${name} ${index}`;
		if (!taken.includes(candidate)) return candidate;
	}
}

const notebookFolder = (name: string) => `${folderName(name)}.heft`;

class Library {
	root = $state('');
	subjects: SubjectEntry[] = $state([]);
	loaded = $state(false);

	async load() {
		const scanned = await commands.library();
		this.root = scanned.root;
		this.subjects = scanned.subjects
			.map((subject) => ({
				folder: subject.folder,
				meta: subject.meta as unknown as SubjectMeta,
				notebooks: subject.notebooks.map((notebook) => ({
					folder: `${subject.folder}/${notebook.folder}`,
					meta: notebook.meta as unknown as NotebookMeta
				}))
			}))
			.sort((a, b) => a.meta.order - b.meta.order);
		this.loaded = true;
	}

	subject(id: string) {
		return this.subjects.find((subject) => subject.meta.id === id);
	}

	async createSubject(name: string, color = SUBJECT_COLORS[this.subjects.length % SUBJECT_COLORS.length]): Promise<SubjectEntry> {
		const folder = unique(folderName(name), this.subjects.map((subject) => subject.folder));
		const meta: SubjectMeta = { format: FORMAT, id: newId(), name, color, icon: 'book', order: this.subjects.length };
		await writeJson(`${folder}/subject.json`, meta);
		const entry: SubjectEntry = { folder, meta, notebooks: [] };
		this.subjects.push(entry);
		return this.subjects.at(-1)!;
	}

	async createNotebook(subject: SubjectEntry, name: string, paper: Paper = DEFAULT_PAPER): Promise<NotebookEntry> {
		const taken = subject.notebooks.map((notebook) => notebook.folder.slice(subject.folder.length + 1));
		const folder = `${subject.folder}/${unique(notebookFolder(name), taken)}`;
		const now = Date.now();
		const meta: NotebookMeta = {
			format: FORMAT,
			id: newId(),
			name,
			kind: 'notes',
			subject: subject.meta.id,
			paper,
			pages: [{ id: newId(), created: now }],
			sections: [],
			created: now,
			modified: now
		};
		await writeJson(`${folder}/notebook.json`, meta);
		subject.notebooks.push({ folder, meta });
		return subject.notebooks.at(-1)!;
	}

	open(entry: NotebookEntry): OpenNotebook {
		return new OpenNotebook(entry.folder, entry.meta);
	}
}

export const library = new Library();
