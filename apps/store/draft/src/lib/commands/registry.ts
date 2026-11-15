import { selectSelectionMatches } from '@codemirror/search';
import { addCursorAbove, addCursorBelow, toggleComment } from '@codemirror/commands';
import type { EditorView } from '@codemirror/view';
import { t } from '@luft/i18n';
import type { App } from '#lib/app/app.svelte.js';
import { showInFolder } from '#lib/bridge/index.js';
import { reload } from '#lib/documents/opening.js';
import { save, saveAll, saveAs } from '#lib/documents/saving.js';
import { openSearch } from '#lib/editor/search/panel.js';
import { trimTrailingWhitespace } from '#lib/editor/whitespace.js';
import { defaultIndentationPicker, encodingPicker, indentationPicker, languagePicker, lineEndingPicker } from '#lib/palette/pickers.js';
import { quickOpen } from '#lib/palette/sources.js';

export interface Command {
	id: string;
	title: () => string;
	keys?: string[];
	editorKeys?: string;
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
		{ id: 'file.new', title: () => t('draft-command-new-file'), keys: ['Ctrl+N'], run: () => app.newFile() },
		{ id: 'file.open', title: () => t('draft-command-open-file'), keys: ['Ctrl+O'], run: () => void app.openFiles() },
		{ id: 'folder.open', title: () => t('draft-command-open-folder'), keys: ['Ctrl+Shift+O'], run: () => void app.openFolder() },
		{ id: 'folder.close', title: () => t('draft-command-close-folder'), available: () => workspace.tree.root !== null, run: () => workspace.tree.close() },
		{ id: 'file.save', title: () => t('draft-command-save'), keys: ['Ctrl+S'], available: hasDocument, run: () => void save(workspace, active()!) },
		{ id: 'file.saveAs', title: () => t('draft-command-save-as'), keys: ['Ctrl+Shift+S'], available: hasDocument, run: () => void saveAs(workspace, active()!) },
		{ id: 'file.saveAll', title: () => t('draft-command-save-all'), keys: ['Ctrl+Alt+S'], run: () => void saveAll(workspace) },
		{
			id: 'file.revert',
			title: () => t('draft-command-revert'),
			available: () => Boolean(active()?.path && active()?.dirty),
			run: () => void reload(workspace, active()!)
		},
		{ id: 'tab.close', title: () => t('draft-command-close-tab'), keys: ['Ctrl+W'], available: hasDocument, run: () => void workspace.close(active()!) },
		{ id: 'tab.closeOthers', title: () => t('draft-command-close-other-tabs'), available: () => workspace.documents.length > 1, run: () => void workspace.closeOthers(active()!) },
		{ id: 'tab.next', title: () => t('draft-command-next-tab'), keys: ['Ctrl+Tab', 'Ctrl+PageDown'], run: () => workspace.cycle(1) },
		{ id: 'tab.previous', title: () => t('draft-command-previous-tab'), keys: ['Ctrl+Shift+Tab', 'Ctrl+PageUp'], run: () => workspace.cycle(-1) },
		{ id: 'palette.files', title: () => t('draft-command-go-to-file'), keys: ['Ctrl+P'], run: () => app.showQuickOpen() },
		{ id: 'palette.commands', title: () => t('draft-command-show-commands'), keys: ['Ctrl+Shift+P'], run: () => palette.show(quickOpen(app), '>') },
		{ id: 'editor.goToLine', title: () => t('draft-command-go-to-line'), keys: ['Ctrl+G'], available: hasDocument, run: () => palette.show(quickOpen(app), ':') },
		{ id: 'editor.find', title: () => t('draft-command-find'), keys: ['Ctrl+F'], available: hasDocument, run: search(false) },
		{ id: 'editor.replace', title: () => t('draft-command-replace'), keys: ['Ctrl+H'], available: hasDocument, run: search(true) },
		{ id: 'editor.selectMatches', title: () => t('draft-command-select-matches'), editorKeys: 'Ctrl+Shift+L', available: hasDocument, run: withView(selectSelectionMatches) },
		{ id: 'editor.cursorAbove', title: () => t('draft-command-cursor-above'), editorKeys: 'Ctrl+Alt+↑', available: hasDocument, run: withView(addCursorAbove) },
		{ id: 'editor.cursorBelow', title: () => t('draft-command-cursor-below'), editorKeys: 'Ctrl+Alt+↓', available: hasDocument, run: withView(addCursorBelow) },
		{ id: 'editor.comment', title: () => t('draft-command-toggle-comment'), editorKeys: 'Ctrl+/', available: hasDocument, run: withView(toggleComment) },
		{ id: 'editor.trim', title: () => t('draft-command-trim-whitespace'), available: hasDocument, run: withView(trimTrailingWhitespace) },
		{ id: 'view.sidebar', title: () => t('draft-command-toggle-sidebar'), keys: ['Ctrl+B'], available: () => workspace.browsing, run: () => app.settings.update({ sidebar: !app.settings.value.sidebar }) },
		{ id: 'view.wrap', title: () => t('draft-command-toggle-wrap'), keys: ['Alt+Z'], run: () => app.toggleWrap() },
		{ id: 'view.preview', title: () => t('draft-command-toggle-preview'), keys: ['Ctrl+Shift+V'], available: () => app.markdown, run: () => app.togglePreview() },
		{ id: 'view.zoomIn', title: () => t('draft-command-larger-text'), keys: ['Ctrl+=', 'Ctrl+Shift+='], run: () => app.zoom(1) },
		{ id: 'view.zoomOut', title: () => t('draft-command-smaller-text'), keys: ['Ctrl+-'], run: () => app.zoom(-1) },
		{ id: 'view.zoomReset', title: () => t('draft-command-reset-text-size'), keys: ['Ctrl+0'], run: () => app.zoom(0) },
		{ id: 'document.language', title: () => t('draft-command-change-language'), available: hasDocument, run: pick(languagePicker) },
		{ id: 'document.encoding', title: () => t('draft-command-change-encoding'), available: hasDocument, run: pick(encodingPicker) },
		{ id: 'document.indentation', title: () => t('draft-command-change-indentation'), available: hasDocument, run: pick(indentationPicker) },
		{ id: 'settings.indentation', title: () => t('draft-command-change-default-indentation'), run: () => palette.show(defaultIndentationPicker(app)) },
		{ id: 'document.lineEndings', title: () => t('draft-command-change-line-endings'), available: hasDocument, run: pick(lineEndingPicker) },
		{ id: 'file.reveal', title: () => t('draft-command-reveal'), available: () => Boolean(active()?.path && workspace.tree.root), run: () => app.reveal(active()!) },
		{ id: 'file.showInFolder', title: () => t('draft-command-show-in-rover'), available: () => Boolean(active()?.path), run: () => void showInFolder(active()!.path!) },
		{ id: 'file.copyPath', title: () => t('draft-command-copy-path'), available: () => Boolean(active()?.path), run: () => void navigator.clipboard.writeText(active()!.path!) }
	];
}
