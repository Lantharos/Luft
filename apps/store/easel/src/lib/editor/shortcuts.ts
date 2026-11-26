import { t } from '@luft/i18n';
import type { App } from '#lib/app/app.svelte.js';
import { invertSelection, eraseSelection, selectAll } from '#lib/document/actions.js';
import { copyImage, cutImage, pasteImage } from '#lib/files/clipboard.js';
import type { Editor } from './editor.svelte';
import { TOOLS } from './tools';

const BRUSH_STEP = 1.2;

function typing(event: KeyboardEvent) {
	const target = event.target as HTMLElement | null;
	return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
}

export function editorShortcut(app: App, editor: Editor, event: KeyboardEvent) {
	if (typing(event) || app.dialog || editor.panel) return;
	const { doc, settings, viewport } = editor;
	const mod = event.ctrlKey || event.metaKey;
	const key = event.key.toLowerCase();
	if (editor.handler.key?.(event)) return event.preventDefault();
	const run = (action: () => unknown) => {
		event.preventDefault();
		void action();
	};
	if (mod) {
		if (key === 'z' && event.shiftKey) return run(() => editor.redo());
		if (key === 'z') return run(() => editor.undo());
		if (key === 'y') return run(() => editor.redo());
		if (key === 's') return run(() => app.save(event.shiftKey));
		if (key === 'o') return run(() => app.chooseAndOpen());
		if (key === 'e') return run(() => (app.dialog = 'export'));
		if (key === 'a') return run(() => selectAll(doc));
		if (key === 'd') return run(() => doc.clearSelection(t('easel-history-deselect')));
		if (key === 'i' && event.shiftKey) return run(() => invertSelection(doc));
		if (key === 'c') return run(() => copyImage(doc, event.shiftKey));
		if (key === 'x') return run(() => cutImage(doc));
		if (key === 'v') return run(() => pasteImage(doc, viewport.toDocument(viewport.width / 2, viewport.height / 2)).then((pasted) => pasted && editor.choose('move')));
		if (key === '0') return run(() => viewport.fit(doc.width, doc.height, true));
		if (key === '1') return run(() => viewport.actualSize(doc.width, doc.height));
		if (key === '=' || key === '+') return run(() => viewport.zoomBy(1.25));
		if (key === '-') return run(() => viewport.zoomBy(0.8));
		return;
	}
	if (event.altKey) return;
	if (key === 'delete' || key === 'backspace') return run(() => eraseSelection(doc));
	if (key === 'x') return run(() => settings.swap());
	if (key === 'q') return run(() => editor.toggleQuickMask());
	if (key === '[' || key === ']') {
		const brush = settings.tool === 'eraser' ? settings.eraser : settings.brush;
		return run(() => (brush.size = Math.max(1, Math.min(500, Math.round(key === ']' ? brush.size * BRUSH_STEP + 1 : brush.size / BRUSH_STEP)))));
	}
	const tool = TOOLS.find((entry) => entry.key === key);
	if (tool) run(() => editor.choose(tool.id));
}
