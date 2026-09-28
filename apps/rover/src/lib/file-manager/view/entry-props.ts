import { createContext } from 'svelte';
import type { FileEntry } from '$lib/types';
import type { VcsState } from '$lib/vcs/state.svelte';
import type { ChooserState } from '../chooser.svelte';
import type { DragController } from '../drag/controller.svelte';
import { dropKey } from '../drag/drop-targets';
import type { FileManager } from '../manager.svelte';
import { DRAFT_PATH } from './draft';
import type { ViewState } from './view-state.svelte';

export type EntryContext = {
	manager: FileManager;
	drag: DragController;
	view: ViewState;
	vcs: VcsState;
	chooser: ChooserState | null;
};

export const [entryContext, setEntryContext] = createContext<EntryContext>();

type Select = (entry: FileEntry, event: MouseEvent) => void;

export function entryClasses(entry: FileEntry, { manager, drag, view }: EntryContext) {
	const selected = manager.selection.has(entry.path) || entry.path === DRAFT_PATH;
	return [
		'entry',
		selected && 'is-selected',
		view.cursor === entry.path && manager.selection.size !== 1 && 'is-cursor',
		drag.target?.key === dropKey('entry', entry.path) && 'is-drop-target',
		drag.dragging && selected && 'is-dragging',
		manager.cuttingPaths.has(entry.path) && 'is-cut',
		entry.is_hidden && 'is-hidden-file'
	];
}

export function entryProps(entry: FileEntry, { manager, drag, view, chooser }: EntryContext, select: Select = view.click) {
	if (entry.path === DRAFT_PATH) return {};
	const key = entry.is_dir ? dropKey('entry', entry.path) : undefined;
	const blocked = (event: Event) => event.preventDefault();
	return {
		role: 'option',
		'aria-selected': manager.selection.has(entry.path),
		'data-entry-path': entry.path,
		'data-drop-path': entry.is_dir ? entry.path : undefined,
		'data-drop-key': key,
		draggable: !chooser,
		onclick: (event: MouseEvent) => select(entry, event),
		ondblclick: () => (chooser ? chooser.open(entry) : manager.openEntry(entry)),
		onauxclick: (event: MouseEvent) => {
			if (!chooser && event.button === 1 && entry.is_dir) void manager.openTab(entry.path);
		},
		oncontextmenu: (event: MouseEvent) => (chooser ? blocked(event) : manager.openContextMenu(event, entry)),
		ondragstart: (event: DragEvent) => (chooser ? blocked(event) : drag.start(event, entry)),
		ondragend: drag.end,
		ondragover: (event: DragEvent) => (chooser ? blocked(event) : drag.overEntry(event, entry, key)),
		ondragleave: drag.leave,
		ondrop: (event: DragEvent) => {
			if (entry.is_dir && !chooser) void drag.drop(event, entry.path);
		}
	};
}
