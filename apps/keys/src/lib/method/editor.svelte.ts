import { toast } from '$lib/state/toast.svelte';
import { saveMethod, tryMethod, type Method } from './api';

const SAVE_DELAY = 500;
const TRY_DELAY = 150;

export type Table = 'rules' | 'words' | 'sequences';

export interface Row {
	uid: number;
	keys: string;
	text: string;
	after: string;
}

type Field = 'keys' | 'text' | 'after';

export class MethodEditor {
	method = $state<Method>() as Method;
	rules = $state.raw<Row[]>([]);
	words = $state.raw<Row[]>([]);
	sequences = $state.raw<Row[]>([]);
	saved = $state(true);

	#uid = 0;
	#saveTimer: ReturnType<typeof setTimeout> | undefined;
	#tryTimer: ReturnType<typeof setTimeout> | undefined;
	#onsaved: () => void;

	constructor(method: Method, onsaved: () => void) {
		this.method = method;
		this.rules = method.rules.map((rule) => this.#row(rule.keys, rule.text, rule.after ?? ''));
		this.words = method.words.map((entry) => this.#row(entry.keys, entry.text));
		this.sequences = method.sequences.map((entry) => this.#row(entry.keys, entry.text));
		this.#onsaved = onsaved;
		void tryMethod(this.snapshot());
	}

	#row(keys: string, text: string, after = ''): Row {
		return { uid: ++this.#uid, keys, text, after };
	}

	add(table: Table) {
		const row = this.#row('', '');
		this[table] = [...this[table], row];
		return row;
	}

	update(table: Table, uid: number, field: Field, value: string) {
		this[table] = this[table].map((row) => (row.uid === uid ? { ...row, [field]: value } : row));
		this.changed();
	}

	remove(table: Table, uid: number) {
		this[table] = this[table].filter((row) => row.uid !== uid);
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
