import * as tools from '#lib/features/actions.js';
import { history } from '#lib/features/history.svelte.js';
import type { ChooserState } from './chooser.svelte';
import type { FileManager } from './manager.svelte';
import { handleViewKey } from './view/keys';
import type { ViewState } from './view/view-state.svelte';

type KeyboardContext = {
	manager: FileManager;
	chooser: ChooserState | null;
	view: ViewState;
	focusSearch: () => void;
};

export function handleKeydown(event: KeyboardEvent, context: KeyboardContext) {
	const { manager, chooser } = context;
	const primary = event.ctrlKey || event.metaKey;
	const key = event.key.toLowerCase();

	if (document.querySelector('[aria-modal="true"]')) return;
	if (primary && !event.altKey && key === 'f') {
		event.preventDefault();
		return event.shiftKey ? tools.searchHere(manager) : context.focusSearch();
	}
	if (event.key === 'F5') {
		event.preventDefault();
		return void manager.refresh();
	}
	if (event.key === 'F2') {
		if (chooser) return;
		if (manager.selection.size > 1) tools.rename(manager, tools.selection(manager));
		else startRename(event, manager);
		return;
	}
	if (isEditable(event.target) || handleViewKey(event, context)) return;

	if (chooser) return handleChooserKey(event, chooser, primary && key === 'a');
	if (primary && (key === 'z' || key === 'y')) {
		event.preventDefault();
		return key === 'y' || event.shiftKey ? history.redo() : history.undo();
	}
	if (event.altKey && event.key === 'Enter' && manager.selection.size > 0) {
		event.preventDefault();
		return tools.showProperties(manager, tools.selection(manager));
	}
	if (primary) return handleShortcut(event, manager, key);
	if (event.key === 'Delete') void manager.actions.trashSelected();
	if (event.key === 'Backspace') manager.goUp();
	if (event.key === 'Escape') {
		manager.selection.clear();
		manager.draft = null;
		manager.closeMenus();
	}
}

function handleChooserKey(event: KeyboardEvent, chooser: ChooserState, selectAll: boolean) {
	if (selectAll) {
		event.preventDefault();
		chooser.selectAll();
	} else if (event.key === 'Enter' && chooser.canAccept) {
		event.preventDefault();
		void chooser.submit();
	} else if (event.key === 'Escape') {
		event.preventDefault();
		void chooser.cancel();
	}
}

function handleShortcut(event: KeyboardEvent, manager: FileManager, key: string) {
	const shortcuts: Record<string, () => unknown> = {
		c: manager.actions.copy,
		x: manager.actions.cut,
		v: manager.actions.paste,
		a: () => manager.replaceSelection(manager.view === 'trash' ? manager.trash.items.map((item) => item.id) : manager.displayEntries.map((entry) => entry.path)),
		t: () => manager.openTab(),
		w: () => manager.closeTab(manager.tabs.activeId)
	};
	const shortcut = shortcuts[key];
	if (!shortcut) return;
	event.preventDefault();
	void shortcut();
}

function startRename(event: KeyboardEvent, manager: FileManager) {
	if (manager.draft || manager.view !== 'home' || manager.selection.size !== 1) return;
	const [path] = manager.selection;
	const target = manager.entries.find((entry) => entry.path === path);
	if (!target) return;
	event.preventDefault();
	if (event.target instanceof HTMLElement) event.target.blur();
	manager.startRename(target);
}

function isEditable(target: EventTarget | null) {
	return target instanceof Element && Boolean(target.closest('input, textarea, [contenteditable="true"]'));
}
