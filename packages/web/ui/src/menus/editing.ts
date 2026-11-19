export function rememberFocus() {
	const field = document.activeElement;
	if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
		const { selectionStart, selectionEnd } = field;
		return () => {
			field.focus();
			if (selectionStart !== null) field.setSelectionRange(selectionStart, selectionEnd);
		};
	}
	const selection = document.getSelection();
	const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
	return () => {
		if (field instanceof HTMLElement) field.focus();
		if (!range) return;
		selection!.removeAllRanges();
		selection!.addRange(range);
	};
}

export function editorSelectsAll() {
	const field = document.activeElement;
	if (!(field instanceof HTMLElement) || !field.isContentEditable) return false;
	const shortcut = new KeyboardEvent('keydown', { key: 'a', code: 'KeyA', ctrlKey: true, bubbles: true, cancelable: true });
	return !field.dispatchEvent(shortcut);
}
