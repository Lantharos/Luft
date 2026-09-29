import { settings } from '$lib/state/settings.svelte';
import { isDirectionKey } from './layout';
import type { Workspace } from './workspace.svelte';

type Action = (workspace: Workspace) => unknown;

const zoomIn: Action = () => settings.zoom(1);

const ACTIONS: Record<string, Action> = {
	'Ctrl+Shift+T': (workspace) => workspace.openTab(),
	'Ctrl+Shift+W': (workspace) => workspace.focused && workspace.closeSession(workspace.focused),
	'Ctrl+Shift+D': (workspace) => workspace.split('row'),
	'Ctrl+Shift+E': (workspace) => workspace.split('column'),
	'Ctrl+Shift+F': (workspace) => (workspace.searching = workspace.focused),
	'Ctrl+Shift+C': (workspace) => workspace.focused?.copySelection(),
	'Ctrl+Shift+A': (workspace) => workspace.focused?.terminal.selectAll(),
	'Ctrl+Shift+K': (workspace) => workspace.focused?.terminal.clear(),
	'Ctrl+PageUp': (workspace) => workspace.selectOffset(-1),
	'Ctrl+PageDown': (workspace) => workspace.selectOffset(1),
	'Ctrl+Shift+PageUp': (workspace) => workspace.moveTab(-1),
	'Ctrl+Shift+PageDown': (workspace) => workspace.moveTab(1),
	'Ctrl+Shift+ArrowUp': (workspace) => workspace.focused?.scrollToPrompt(-1),
	'Ctrl+Shift+ArrowDown': (workspace) => workspace.focused?.scrollToPrompt(1),
	'Ctrl+Shift+Home': (workspace) => workspace.focused?.terminal.scrollToTop(),
	'Ctrl+Shift+End': (workspace) => workspace.focused?.terminal.scrollToBottom(),
	'Ctrl+=': zoomIn,
	'Ctrl++': zoomIn,
	'Ctrl+Shift++': zoomIn,
	'Ctrl+-': () => settings.zoom(-1),
	'Ctrl+0': () => settings.zoom(0),
	'Ctrl+,': (workspace) => (workspace.preferencesOpen = true)
};

const NATIVE_PASTE = new Set(['Ctrl+Shift+V', 'Shift+Insert']);

function chord(event: KeyboardEvent) {
	const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
	return [event.ctrlKey && 'Ctrl', event.altKey && 'Alt', event.shiftKey && 'Shift', key].filter(Boolean).join('+');
}

function tabAction(event: KeyboardEvent): Action | undefined {
	if (!event.altKey || event.ctrlKey || event.shiftKey || !/^[1-9]$/.test(event.key)) return;
	const index = Number(event.key) - 1;
	return (workspace) => {
		const tab = event.key === '9' ? workspace.tabs.at(-1) : workspace.tabs[index];
		if (tab) workspace.select(tab);
	};
}

function paneAction(event: KeyboardEvent, workspace: Workspace): Action | undefined {
	const single = (workspace.active?.sessions.length ?? 0) < 2;
	if (single || !event.altKey || event.ctrlKey || event.shiftKey || !isDirectionKey(event.key)) return;
	return () => workspace.focusNeighbor(event.key);
}

export function handleShortcut(event: KeyboardEvent, workspace: Workspace) {
	const name = chord(event);
	if (NATIVE_PASTE.has(name)) return false;
	const action = ACTIONS[name] ?? tabAction(event) ?? paneAction(event, workspace);
	if (!action) return true;
	event.preventDefault();
	if (event.type === 'keydown') action(workspace);
	return false;
}
