import type { ViewMode } from '$lib/types';
import type { ChooserState } from '../chooser.svelte';
import type { FileManager } from '../manager.svelte';
import type { Direction, ViewState } from './view-state.svelte';

type ViewKeyContext = {
	manager: FileManager;
	view: ViewState;
	chooser: ChooserState | null;
};

type Action = () => unknown;

const VIEW_MODE_KEYS: Record<string, ViewMode> = { '1': 'list', '2': 'grid', '3': 'columns' };
const DIRECTIONS: Record<string, Direction> = {
	ArrowUp: 'up',
	ArrowDown: 'down',
	ArrowLeft: 'left',
	ArrowRight: 'right',
	Home: 'first',
	End: 'last',
	PageUp: 'page-up',
	PageDown: 'page-down'
};

export function handleViewKey(event: KeyboardEvent, context: ViewKeyContext) {
	const action = viewKeyAction(event, context);
	if (!action) return false;
	event.preventDefault();
	void action();
	return true;
}

function viewKeyAction(event: KeyboardEvent, { manager, view, chooser }: ViewKeyContext): Action | null {
	const primary = event.ctrlKey || event.metaKey;
	const { key } = event;

	if (view.quickLook && (key === 'Escape' || key === ' ')) return () => (view.quickLook = false);
	if (primary && event.shiftKey && !chooser && key.toLowerCase() === 'n') return () => manager.startCreate('folder');
	if (primary && !event.altKey && !event.shiftKey) return primaryAction(key, manager, view);
	if (event.altKey && !primary) return altAction(key, manager, view);
	if (primary || event.altKey || manager.view === 'trash') return null;

	const direction = DIRECTIONS[key];
	if (direction) return moveAction(direction, event.shiftKey, manager, view);
	if (key === 'Enter' && !event.shiftKey) return chooser && !view.focused?.is_dir ? null : view.openFocused;
	if (key === ' ' && !view.typeSelect.active) return view.toggleQuickLook;
	if (key.length === 1) return () => view.typeAhead(key);
	return null;
}

function primaryAction(key: string, manager: FileManager, view: ViewState): Action | null {
	const mode = VIEW_MODE_KEYS[key];
	if (mode) return manager.view === 'home' ? () => manager.setViewMode(mode) : null;
	const actions: Record<string, Action> = {
		'=': () => view.zoom(1),
		'+': () => view.zoom(1),
		'-': () => view.zoom(-1),
		'0': view.resetZoom,
		l: () => (view.editingPath = true),
		h: manager.toggleHidden,
		' ': view.toggleFocused
	};
	return actions[key] ?? null;
}

function altAction(key: string, manager: FileManager, view: ViewState): Action | null {
	const actions: Record<string, Action> = {
		ArrowLeft: manager.goBack,
		ArrowRight: manager.goForward,
		ArrowUp: manager.goUp,
		ArrowDown: view.enterFocused,
		p: view.toggleDetails,
		P: view.toggleDetails
	};
	return actions[key] ?? null;
}

function moveAction(direction: Direction, extend: boolean, manager: FileManager, view: ViewState): Action | null {
	const horizontal = direction === 'left' || direction === 'right';
	if (horizontal && manager.viewMode === 'columns') return direction === 'left' ? manager.goUp : view.enterFocused;
	if (horizontal && manager.viewMode !== 'grid') return null;
	return () => view.move(direction, extend);
}
