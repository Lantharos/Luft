const TEXT_INPUTS = new Set(['text', 'search', 'url', 'tel', 'email', 'number', 'password']);

type TextControl = HTMLInputElement | HTMLTextAreaElement;

function editingHost(element: Element) {
	if (element instanceof HTMLInputElement) return TEXT_INPUTS.has(element.type) && !element.disabled ? element : null;
	if (element instanceof HTMLTextAreaElement) return element.disabled ? null : element;
	if (!(element instanceof HTMLElement) || !element.isContentEditable) return null;
	return element.closest<HTMLElement>('[contenteditable]:not([contenteditable="false"])');
}

export function editableAt(event: MouseEvent) {
	const [target] = event.composedPath();
	return target instanceof Element ? editingHost(target) : null;
}

const isControl = (field: HTMLElement): field is TextControl => field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement;

export class TextEditing {
	readonly field: HTMLElement | null;
	readonly selected: boolean;
	readonly writable: boolean;
	readonly copyable: boolean;
	#range: Range | null = null;
	#start: number | null = null;
	#end: number | null = null;

	constructor(field: HTMLElement | null) {
		this.field = field;
		const selection = document.getSelection();
		if (field && isControl(field)) {
			this.#start = field.selectionStart;
			this.#end = field.selectionEnd;
			this.selected = this.#start !== this.#end;
			this.writable = !field.readOnly;
			this.copyable = field.type !== 'password';
		} else {
			this.#range = selection?.rangeCount ? selection.getRangeAt(0) : null;
			this.selected = Boolean(selection && !selection.isCollapsed);
			this.writable = field !== null;
			this.copyable = true;
		}
	}

	#restore() {
		const field = this.field;
		field?.focus();
		if (field && isControl(field) && this.#start !== null) field.setSelectionRange(this.#start, this.#end);
		else if (this.#range) {
			const selection = document.getSelection();
			selection?.removeAllRanges();
			selection?.addRange(this.#range);
		}
	}

	#run(command: 'cut' | 'copy' | 'selectAll') {
		this.#restore();
		document.execCommand(command);
	}

	cut = () => this.#run('cut');
	copy = () => this.#run('copy');

	paste = async () => {
		const text = await navigator.clipboard.readText();
		this.#restore();
		document.execCommand('insertText', false, text);
	};

	selectAll = () => {
		const field = this.field;
		if (!field) return;
		if (isControl(field)) return field.select();
		field.focus();
		const shortcut = new KeyboardEvent('keydown', { key: 'a', code: 'KeyA', ctrlKey: true, bubbles: true, cancelable: true });
		if (field.dispatchEvent(shortcut)) document.getSelection()?.selectAllChildren(field);
	};
}
