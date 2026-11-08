import { writeJson } from '#lib/bridge/files.js';
import { commands, type Trashed } from '#lib/bindings.js';
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

function unique(name: string, taken: string[], suffix = ''): string {
	if (!taken.includes(name + suffix)) return name + suffix;
	for (let index = 2; ; index++) {
		const candidate = `${name} ${index}${suffix}`;
		if (!taken.includes(candidate)) return candidate;
	}
}

const NOTEBOOK_SUFFIX = '.heft';
const leaf = (folder: string) => folder.slice(folder.lastIndexOf('/') + 1);

class Library {
	root = $state('');
	subjects: SubjectEntry[] = $state([]);
	private readonly open = new Map<string, OpenNotebook>();

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
	}

	get active() {
		return this.subjects.filter((subject) => !subject.meta.archived);
	}

	get archived() {
		return this.subjects.filter((subject) => subject.meta.archived);
	}

	get notebooks() {
		return this.subjects.flatMap((subject) => subject.notebooks);
	}

	subject(id: string) {
		return this.subjects.find((subject) => subject.meta.id === id);
	}

	subjectOf(notebook: NotebookEntry) {
		return this.subjects.find((subject) => subject.notebooks.includes(notebook)) ?? this.subject(notebook.meta.subject);
	}

	notebook(id: string) {
		return this.notebooks.find((notebook) => notebook.meta.id === id);
	}

	async createSubject(name: string, color = SUBJECT_COLORS[this.subjects.length % SUBJECT_COLORS.length]): Promise<SubjectEntry> {
		const folder = unique(folderName(name), this.subjects.map((subject) => subject.folder));
		const meta: SubjectMeta = { format: FORMAT, id: newId(), name, color, icon: 'book', order: this.subjects.length };
		await writeJson(`${folder}/subject.json`, meta);
		this.subjects.push({ folder, meta, notebooks: [] });
		return this.subjects.at(-1)!;
	}

	async updateSubject(subject: SubjectEntry, changes: Partial<Pick<SubjectMeta, 'name' | 'color' | 'archived'>>) {
		if (changes.name && changes.name !== subject.meta.name) {
			const folder = unique(folderName(changes.name), this.subjects.filter((other) => other !== subject).map((other) => other.folder));
			await this.settleIn(subject.notebooks);
			if (folder !== subject.folder) {
				await commands.rename({ from: subject.folder, to: folder });
				for (const notebook of subject.notebooks) notebook.folder = `${folder}/${leaf(notebook.folder)}`;
				subject.folder = folder;
			}
		}
		Object.assign(subject.meta, changes);
		await this.saveSubject(subject);
	}

	saveSubject(subject: SubjectEntry) {
		return writeJson(`${subject.folder}/subject.json`, $state.snapshot(subject.meta));
	}

	async reorderSubjects(order: SubjectEntry[]) {
		order.forEach((subject, index) => (subject.meta.order = index));
		this.subjects.sort((a, b) => a.meta.order - b.meta.order);
		await Promise.all(order.map((subject) => this.saveSubject(subject)));
	}

	async createNotebook(subject: SubjectEntry, name: string, paper: Paper = DEFAULT_PAPER): Promise<NotebookEntry> {
		const folder = `${subject.folder}/${unique(folderName(name), subject.notebooks.map((notebook) => leaf(notebook.folder)), NOTEBOOK_SUFFIX)}`;
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

	/** Renames a notebook and moves it to another subject, in one step on disk. */
	async placeNotebook(notebook: NotebookEntry, name: string, subject: SubjectEntry) {
		const from = this.subjectOf(notebook)!;
		const others = subject.notebooks.filter((other) => other !== notebook).map((other) => leaf(other.folder));
		const folder = `${subject.folder}/${unique(folderName(name), others, NOTEBOOK_SUFFIX)}`;
		await this.settleIn([notebook]);
		if (folder !== notebook.folder) await commands.rename({ from: notebook.folder, to: folder });
		notebook.folder = folder;
		notebook.meta.name = name;
		notebook.meta.subject = subject.meta.id;
		if (from !== subject) {
			from.notebooks.splice(from.notebooks.indexOf(notebook), 1);
			subject.notebooks.push(notebook);
		}
		await writeJson(`${notebook.folder}/notebook.json`, $state.snapshot(notebook.meta));
	}

	async trashNotebook(notebook: NotebookEntry): Promise<Trashed> {
		await this.settleIn([notebook]);
		this.forget(notebook);
		const subject = this.subjectOf(notebook)!;
		subject.notebooks.splice(subject.notebooks.indexOf(notebook), 1);
		return commands.trashPut({ path: notebook.folder });
	}

	async trashSubject(subject: SubjectEntry): Promise<Trashed> {
		await this.settleIn(subject.notebooks);
		subject.notebooks.forEach((notebook) => this.forget(notebook));
		this.subjects.splice(this.subjects.indexOf(subject), 1);
		return commands.trashPut({ path: subject.folder });
	}

	async restore(item: Trashed) {
		const parent = item.from.includes('/') ? item.from.slice(0, item.from.lastIndexOf('/')) : '';
		const name = leaf(item.from);
		const taken = parent ? (this.subjects.find((subject) => subject.folder === parent)?.notebooks.map((notebook) => leaf(notebook.folder)) ?? []) : this.subjects.map((subject) => subject.folder);
		const free = name.endsWith(NOTEBOOK_SUFFIX) ? unique(name.slice(0, -NOTEBOOK_SUFFIX.length), taken, NOTEBOOK_SUFFIX) : unique(name, taken);
		await commands.trashRestore({ id: item.id, to: parent ? `${parent}/${free}` : free });
		await this.load();
	}

	openNotebook(entry: NotebookEntry): OpenNotebook {
		let notebook = this.open.get(entry.meta.id);
		if (!notebook) {
			notebook = new OpenNotebook(entry);
			this.open.set(entry.meta.id, notebook);
		}
		return notebook;
	}

	private forget(entry: NotebookEntry) {
		this.open.get(entry.meta.id)?.drop();
		this.open.delete(entry.meta.id);
	}

	private async settleIn(notebooks: NotebookEntry[]) {
		await Promise.all(notebooks.map((entry) => this.open.get(entry.meta.id)?.settle()));
	}
}

export const library = new Library();
