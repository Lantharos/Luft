import type { EditorState, Text } from '@codemirror/state';
import type { Stat } from '#lib/bridge/types.js';
import type { Indentation } from '#lib/editor/indentation.js';
import { basename } from '#lib/utils/paths.js';
import type { LineEnding } from './encodings';

export type DiskState = 'current' | 'changed' | 'deleted';

let untitledCount = 0;
let nextId = 0;

export class Document {
	readonly id: string;
	readonly untitled: number;
	path = $state<string | null>(null);
	dirty = $state(false);
	encoding = $state('utf-8');
	bom = $state(false);
	lineEnding = $state<LineEnding>('lf');
	indentation = $state<Indentation>({ tabs: true, width: 4 });
	language = $state<string | null>(null);
	disk = $state<DiskState>('current');
	stat: Stat | null = null;
	saved!: Text;
	savedFormat = '';
	state!: EditorState;
	top = 0;
	backup: string | null = null;
	saving = false;

	get name() {
		if (this.path) return basename(this.path);
		return this.untitled > 1 ? `Untitled ${this.untitled}` : 'Untitled';
	}

	get format() {
		return `${this.encoding}:${this.bom}:${this.lineEnding}`;
	}

	markSaved(text: Text) {
		this.saved = text;
		this.savedFormat = this.format;
	}

	constructor(path: string | null, id?: string) {
		this.id = id ?? `${Date.now().toString(36)}-${(nextId++).toString(36)}`;
		this.path = path;
		this.untitled = path ? 0 : ++untitledCount;
	}
}
