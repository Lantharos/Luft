import { selectSelectionMatches } from '@codemirror/search';
import { addCursorAbove, addCursorBelow, toggleComment } from '@codemirror/commands';
import type { EditorView } from '@codemirror/view';
import type { App } from '$lib/app.svelte';
import { reload } from '$lib/documents/opening';
import { save, saveAll, saveAs } from '$lib/documents/saving';
import { openSearch } from '$lib/editor/search/panel';
import { trimTrailingWhitespace } from '$lib/editor/whitespace';
import { defaultIndentationPicker, encodingPicker, indentationPicker, languagePicker, lineEndingPicker } from '$lib/palette/pickers';
import { quickOpen } from '$lib/palette/sources';

export interface Command {
	id: string;
	title: string;
	keys?: string[];
	hint?: string;
	available?: () => boolean;
	run: () => void;
}

export function buildCommands(app: App): Command[] {
	const { workspace, palette } = app;
	const active = () => workspace.active;
	const hasDocument = () => workspace.active !== null;
	const withView = (run: (view: EditorView) => unknown) => () => {
		const view = workspace.editor.view;
		if (!view || !workspace.active) return;
		run(view);
		view.focus();
	};
	const search = (replace: boolean) => () => {
		const view = workspace.editor.view;
		if (view && workspace.active) openSearch(view, replace);
	};
	const pick = (build: typeof languagePicker) => () => {
		const document = active();
		if (document) palette.show(build(app, document));
	};
	return [
		{ id: 'file.new', title: 'New File', keys: ['Ctrl+N'], run: () => app.newFile() },
		{ id: 'file.open', title: 'Open File…', keys: ['Ctrl+O'], run: () => void app.openFiles() },
		{ id: 'folder.open', title: 'Open Folder…', keys: ['Ctrl+Shift+O'], run: () => void app.openFolder() },
		{ id: 'folder.close', title: 'Close Folder', available: () => workspace.tree.root !== null, run: () => workspace.tree.close() },
		{ id: 'file.save', title: 'Save', keys: ['Ctrl+S'], available: hasDocument, run: () => void save(workspace, active()!) },
		{ id: 'file.saveAs', title: 'Save As…', keys: ['Ctrl+Shift+S'], available: hasDocument, run: () => void saveAs(workspace, active()!) },
		{ id: 'file.saveAll', title: 'Save All', keys: ['Ctrl+Alt+S'], run: () => void saveAll(workspace) },
		{
			id: 'file.revert',
			title: 'Revert to Saved',
			available: () => Boolean(active()?.path && active()?.dirty),
			run: () => void reload(workspace, active()!)
		},
		{ id: 'tab.close', title: 'Close Tab', keys: ['Ctrl+W'], available: hasDocument, run: () => void workspace.close(active()!) },
		{ id: 'tab.closeOthers', title: 'Close Other Tabs', available: () => workspace.documents.length > 1, run: () => void workspace.closeOthers(active()!) },
		{ id: 'tab.next', title: 'Next Tab', keys: ['Ctrl+Tab', 'Ctrl+PageDown'], run: () => workspace.cycle(1) },
		{ id: 'tab.previous', title: 'Previous Tab', keys: ['Ctrl+Shift+Tab', 'Ctrl+PageUp'], run: () => workspace.cycle(-1) },
		{ id: 'palette.files', title: 'Go to File…', keys: ['Ctrl+P'], run: () => app.showQuickOpen() },
		{ id: 'palette.commands', title: 'Show All Commands', keys: ['Ctrl+Shift+P'], run: () => palette.show(quickOpen(app), '>') },
		{ id: 'editor.goToLine', title: 'Go to Line…', keys: ['Ctrl+G'], available: hasDocument, run: () => palette.show(quickOpen(app), ':') },
		{ id: 'editor.find', title: 'Find', keys: ['Ctrl+F'], available: hasDocument, run: search(false) },
		{ id: 'editor.replace', title: 'Replace', keys: ['Ctrl+H'], available: hasDocument, run: search(true) },
		{ id: 'editor.selectMatches', title: 'Select All Occurrences', hint: 'Ctrl+Shift+L', available: hasDocument, run: withView(selectSelectionMatches) },
		{ id: 'editor.cursorAbove', title: 'Add Cursor Above', hint: 'Ctrl+Alt+↑', available: hasDocument, run: withView(addCursorAbove) },
		{ id: 'editor.cursorBelow', title: 'Add Cursor Below', hint: 'Ctrl+Alt+↓', available: hasDocument, run: withView(addCursorBelow) },
		{ id: 'editor.comment', title: 'Toggle Comment', hint: 'Ctrl+/', available: hasDocument, run: withView(toggleComment) },
		{ id: 'editor.trim', title: 'Trim Trailing Whitespace', available: hasDocument, run: withView(trimTrailingWhitespace) },
		{ id: 'view.sidebar', title: 'Toggle Sidebar', keys: ['Ctrl+B'], available: () => workspace.browsing, run: () => app.settings.update({ sidebar: !app.settings.value.sidebar }) },
		{ id: 'view.wrap', title: 'Toggle Word Wrap', keys: ['Alt+Z'], run: () => app.toggleWrap() },
		{ id: 'view.preview', title: 'Toggle Markdown Preview', keys: ['Ctrl+Shift+V'], available: () => app.markdown, run: () => app.togglePreview() },
		{ id: 'view.zoomIn', title: 'Larger Text', keys: ['Ctrl+=', 'Ctrl+Shift+='], run: () => app.zoom(1) },
		{ id: 'view.zoomOut', title: 'Smaller Text', keys: ['Ctrl+-'], run: () => app.zoom(-1) },
		{ id: 'view.zoomReset', title: 'Reset Text Size', keys: ['Ctrl+0'], run: () => app.zoom(0) },
		{ id: 'document.language', title: 'Change Language…', available: hasDocument, run: pick(languagePicker) },
		{ id: 'document.encoding', title: 'Change Encoding…', available: hasDocument, run: pick(encodingPicker) },
		{ id: 'document.indentation', title: 'Change Indentation…', available: hasDocument, run: pick(indentationPicker) },
		{ id: 'settings.indentation', title: 'Change Default Indentation…', run: () => palette.show(defaultIndentationPicker(app)) },
		{ id: 'document.lineEndings', title: 'Change Line Endings…', available: hasDocument, run: pick(lineEndingPicker) },
		{ id: 'file.reveal', title: 'Reveal in Sidebar', available: () => Boolean(active()?.path && workspace.tree.root), run: () => app.reveal(active()!) },
		{ id: 'file.showInFolder', title: 'Show in Files', available: () => Boolean(active()?.path), run: () => void app.backend.showInFolder(active()!.path!) },
		{ id: 'file.copyPath', title: 'Copy Path', available: () => Boolean(active()?.path), run: () => void navigator.clipboard.writeText(active()!.path!) }
	];
}
