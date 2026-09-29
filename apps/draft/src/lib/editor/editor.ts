import { Compartment, EditorSelection, EditorState, type StateEffect, type Text } from '@codemirror/state';
import { EditorView, type ViewUpdate } from '@codemirror/view';
import { loadLanguage } from '@luft/ui/code';
import type { Document } from '$lib/documents/document.svelte';
import { indentationExtension } from './indentation';
import { baseExtensions } from './setup';

export interface Cursor {
	anchor: number;
	head: number;
}

type UpdateHandler = (document: Document, update: ViewUpdate) => void;

const language = new Compartment();
const indentation = new Compartment();
const wrapping = new Compartment();
const NO_WRAP: never[] = [];

function wrapExtension(wrap: boolean) {
	return wrap ? EditorView.lineWrapping : NO_WRAP;
}

function commonPrefix(a: string, b: string) {
	const limit = Math.min(a.length, b.length);
	let index = 0;
	while (index < limit && a.charCodeAt(index) === b.charCodeAt(index)) index++;
	return index;
}

function commonSuffix(a: string, b: string, prefix: number) {
	const limit = Math.min(a.length, b.length) - prefix;
	let index = 0;
	while (index < limit && a.charCodeAt(a.length - 1 - index) === b.charCodeAt(b.length - 1 - index)) index++;
	return index;
}

export class Editor {
	view: EditorView | null = null;
	#shown: Document | null = null;
	#wrap: boolean;
	#onUpdate: UpdateHandler;

	constructor(wrap: boolean, onUpdate: UpdateHandler) {
		this.#wrap = wrap;
		this.#onUpdate = onUpdate;
	}

	mount(parent: HTMLElement) {
		this.view = new EditorView({ parent });
		if (this.#shown) this.#display(this.#shown);
		return () => {
			if (this.#shown) this.#remember(this.#shown);
			this.view?.destroy();
			this.view = null;
		};
	}

	createState(document: Document, text: string, cursor?: Cursor) {
		const length = text.length;
		const clamp = (position: number) => Math.min(Math.max(0, position), length);
		return EditorState.create({
			doc: text,
			selection: cursor && EditorSelection.single(clamp(cursor.anchor), clamp(cursor.head)),
			extensions: [
				baseExtensions,
				language.of([]),
				indentation.of(indentationExtension(document.indentation)),
				wrapping.of(wrapExtension(this.#wrap)),
				EditorView.updateListener.of((update) => this.#onUpdate(document, update))
			]
		});
	}

	state(document: Document) {
		return document === this.#shown && this.view ? this.view.state : document.state;
	}

	get shown() {
		return this.#shown;
	}

	show(document: Document | null) {
		if (document === this.#shown) return;
		if (this.#shown) this.#remember(this.#shown);
		this.#shown = document;
		if (document) this.#display(document);
	}

	focus() {
		this.view?.focus();
	}

	#remember(document: Document) {
		if (!this.view) return;
		document.state = this.view.state;
		document.top = this.topPosition();
	}

	#display(document: Document) {
		if (!this.view) return;
		if (wrapping.get(document.state) !== wrapExtension(this.#wrap)) {
			document.state = document.state.update({ effects: wrapping.reconfigure(wrapExtension(this.#wrap)) }).state;
		}
		this.view.setState(document.state);
		this.view.dispatch({ effects: EditorView.scrollIntoView(document.top, { y: 'start' }) });
	}

	topPosition() {
		if (!this.view) return this.#shown?.top ?? 0;
		return this.view.lineBlockAtHeight(this.view.scrollDOM.scrollTop - this.view.documentPadding.top).from;
	}

	cursor(document: Document): Cursor {
		const { anchor, head } = this.state(document).selection.main;
		return { anchor, head };
	}

	#apply(document: Document, effects: StateEffect<unknown>[]) {
		if (document === this.#shown && this.view) this.view.dispatch({ effects });
		else document.state = document.state.update({ effects }).state;
	}

	async applyLanguage(document: Document) {
		const support = document.language ? await loadLanguage(document.language) : null;
		this.#apply(document, [language.reconfigure(support ?? [])]);
	}

	applyIndentation(document: Document) {
		this.#apply(document, [indentation.reconfigure(indentationExtension(document.indentation))]);
	}

	setWrap(wrap: boolean) {
		this.#wrap = wrap;
		if (this.#shown) this.#apply(this.#shown, [wrapping.reconfigure(wrapExtension(wrap))]);
	}

	replaceText(document: Document, text: string): Text {
		const current = this.state(document).doc.toString();
		const from = commonPrefix(current, text);
		const suffix = commonSuffix(current, text, from);
		const spec = { changes: { from, to: current.length - suffix, insert: text.slice(from, text.length - suffix) } };
		if (document === this.#shown && this.view) this.view.dispatch(spec);
		else document.state = document.state.update(spec).state;
		return this.state(document).doc;
	}

	goTo(line: number, column = 1) {
		if (!this.view) return;
		const { doc } = this.view.state;
		const target = doc.line(Math.min(Math.max(1, line), doc.lines));
		const position = Math.min(target.from + Math.max(0, column - 1), target.to);
		this.view.dispatch({ selection: { anchor: position }, effects: EditorView.scrollIntoView(position, { y: 'center' }) });
		this.view.focus();
	}
}
