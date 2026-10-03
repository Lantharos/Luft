import { History } from '#lib/state/history.svelte.js';
import { toast } from '#lib/state/toast.svelte.js';
import { saveMethod, tryMethod, type Method } from './api';

const SAVE_DELAY = 500;
const TRY_DELAY = 150;

export type Table = 'rules' | 'words' | 'sequences';
export type Tab = Table | 'settings';

export interface Row {
	uid: number;
	keys: string;
	text: string;
	after: string;
}

type Field = 'keys' | 'text' | 'after';
type Setting = 'name' | 'label' | 'language' | 'candidates' | 'learn' | 'compose';

interface Snapshot {
	method: Method;
	rules: Row[];
	words: Row[];
	sequences: Row[];
}

export class MethodEditor {
	method = $state<Method>() as Method;
	rules = $state.raw<Row[]>([]);
	words = $state.raw<Row[]>([]);
	sequences = $state.raw<Row[]>([]);
	tab = $state<Tab>('rules');
	saved = $state(true);
	readonly history = new History<Snapshot>();

	#uid = 0;
	#saveTimer: ReturnType<typeof setTimeout> | undefined;
	#tryTimer: ReturnType<typeof setTimeout> | undefined;
	#onsaved: () => void;

	constructor(method: Method, onsaved: () => void) {
		this.method = method;
		this.rules = method.rules.map((rule) => this.#row(rule.keys, rule.text, rule.after ?? ''));
		this.words = method.words.map((entry) => this.#row(entry.keys, entry.text));
		this.sequences = method.sequences.map((entry) => this.#row(entry.keys, entry.text));
		this.tab = method.rules.length || !method.words.length ? 'rules' : 'words';
		this.#onsaved = onsaved;
		void tryMethod(this.snapshot());
	}

	#row(keys: string, text: string, after = ''): Row {
		return { uid: ++this.#uid, keys, text, after };
	}

	#state(): Snapshot {
		return { method: $state.snapshot(this.method), rules: this.rules, words: this.words, sequences: this.sequences };
	}

	#edit(key: string, apply: () => void) {
		this.history.record(this.#state(), key);
		apply();
		this.changed();
	}

	add(table: Table) {
		const row = this.#row('', '');
		this.#edit(`add:${table}`, () => (this[table] = [...this[table], row]));
		return row;
	}

	update(table: Table, uid: number, field: Field, value: string) {
		this.#edit(`${table}:${uid}:${field}`, () => (this[table] = this[table].map((row) => (row.uid === uid ? { ...row, [field]: value } : row))));
	}

	remove(table: Table, uid: number) {
		this.#edit(`remove:${table}`, () => (this[table] = this[table].filter((row) => row.uid !== uid)));
	}

	set<K extends Setting>(key: K, value: Method[K]) {
		this.#edit(`setting:${key}`, () => (this.method[key] = value));
	}

	duplicates(table: Table) {
		const seen = new Map<string, number>();
		const repeated = new Set<number>();
		for (const row of this[table]) {
			if (!row.keys) continue;
			const id = `${row.keys}\u0000${row.after}`;
			const first = seen.get(id);
			if (first === undefined) seen.set(id, row.uid);
			else if (table !== 'words') repeated.add(row.uid).add(first);
		}
		return repeated;
	}

	undo() {
		const previous = this.history.undo(this.#state());
		if (previous) this.#restore(previous);
	}

	redo() {
		const next = this.history.redo(this.#state());
		if (next) this.#restore(next);
	}

	#restore(snapshot: Snapshot) {
		this.method = snapshot.method;
		this.rules = snapshot.rules;
		this.words = snapshot.words;
		this.sequences = snapshot.sequences;
		this.changed();
	}

	snapshot(): Method {
		const filled = (rows: Row[]) => rows.filter((row) => row.keys && row.text);
		return {
			...$state.snapshot(this.method),
			rules: filled(this.rules).map(({ keys, text, after }) => (after ? { keys, text, after } : { keys, text })),
			words: filled(this.words).map(({ keys, text }) => ({ keys, text })),
			sequences: filled(this.sequences).map(({ keys, text }) => ({ keys, text }))
		};
	}

	changed() {
		this.saved = false;
		clearTimeout(this.#saveTimer);
		clearTimeout(this.#tryTimer);
		this.#saveTimer = setTimeout(() => void this.save(), SAVE_DELAY);
		this.#tryTimer = setTimeout(() => void tryMethod(this.snapshot()), TRY_DELAY);
	}

	discard() {
		clearTimeout(this.#saveTimer);
		this.saved = true;
	}

	async save() {
		clearTimeout(this.#saveTimer);
		if (this.saved) return;
		try {
			await saveMethod(this.snapshot());
			this.saved = true;
			this.#onsaved();
		} catch (error) {
			toast.failed(error);
		}
	}
}
