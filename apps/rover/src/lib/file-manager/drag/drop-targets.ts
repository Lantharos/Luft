export type DropTarget = {
	path: string;
	key: string;
	tabId?: string | null;
};

export const TRASH_DROP_PATH = 'trash';

export function dropKey(scope: string, path: string) {
	return `${scope}:${path}`;
}

export function tabDropKey(id: string) {
	return dropKey('tab', id);
}

export function dropTargetFromPoint(clientX: number, clientY: number): DropTarget | null {
	for (const element of document.elementsFromPoint(clientX, clientY)) {
		const target = element.closest<HTMLElement>('[data-drop-path], [data-drop-trash]');
		if (!target) continue;
		const tabId = target.dataset.dropTabId ?? null;
		if (target.dataset.dropTrash !== undefined) {
			return { path: TRASH_DROP_PATH, key: target.dataset.dropKey ?? TRASH_DROP_PATH, tabId };
		}
		const path = target.dataset.dropPath!;
		return { path, key: target.dataset.dropKey ?? dropKey('path', path), tabId };
	}
	return null;
}
