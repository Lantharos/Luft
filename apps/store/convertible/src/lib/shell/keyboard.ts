import { commands } from '#lib/bindings.js';
import { editor, type Tool } from '#lib/state/editor.svelte.js';
import { session } from '#lib/state/session.svelte.js';

const TOOL_KEYS: Record<string, Tool> = {
	v: 'move',
	c: 'crop',
	a: 'arrow',
	l: 'line',
	b: 'box',
	e: 'ellipse',
	h: 'highlight',
	t: 'text',
	u: 'blur',
	r: 'redact'
};

function typing(event: KeyboardEvent) {
	return event.target instanceof Element && event.target.closest('input, textarea, [contenteditable="true"]') !== null;
}

function editing(event: KeyboardEvent) {
	const primary = event.ctrlKey || event.metaKey;
	const key = event.key.toLowerCase();
	if (primary && key === 'z') return event.shiftKey ? editor.redo() : editor.undo();
	if (primary && key === 'y') return editor.redo();
	if (primary) return false;
	if (key === 'delete' || key === 'backspace') return editor.removeSelected();
	if (key === 'escape') {
		editor.tool = 'move';
		editor.selectedMark = null;
		return;
	}
	if (TOOL_KEYS[key] && editor.visual) {
		editor.tool = TOOL_KEYS[key];
		return;
	}
	return false;
}

export function handleKeydown(event: KeyboardEvent) {
	const primary = event.ctrlKey || event.metaKey;
	if (primary && event.key === 'Enter') {
		event.preventDefault();
		return void session.convert();
	}
	if (typing(event)) return;
	if (primary && event.key === 'o') {
		event.preventDefault();
		return void commands.chooseFiles().then((paths) => session.open(paths));
	}
	if (session.view === 'edit' && editing(event) !== false) event.preventDefault();
}
