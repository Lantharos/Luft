export type DropTarget = {
	path: string;
	key: string;
	tabId?: string | null;
};

export const TRASH_DROP_PATH = 'trash';

export function pathDropKey(path: string) {
	return `path:${path}`;
}

export function scopedDropKey(scope: string, path: string) {
	return `${scope}:${path}`;
}

export function tabDropKey(id: string) {
	return `tab:${id}`;
}

export function trashDropKey() {
	return TRASH_DROP_PATH;
}

export function dropTargetKeyForPath(path: string) {
	return path === TRASH_DROP_PATH ? trashDropKey() : pathDropKey(path);
}

export function dropTargetFromPoint(clientX: number, clientY: number): DropTarget | null {
	for (const element of document.elementsFromPoint(clientX, clientY)) {
		if (!(element instanceof HTMLElement)) continue;
		const target = element.closest<HTMLElement>('[data-drop-key], [data-drop-path], [data-drop-trash="true"]');
		if (!target) continue;
		const key = target.dataset.dropKey;
		const tabId = target.dataset.dropTabId ?? null;
		if (target.dataset.dropTrash === 'true') return { path: TRASH_DROP_PATH, key: key ?? trashDropKey(), tabId };
		const pathTarget = target.closest<HTMLElement>('[data-drop-path]') ?? target;
		const path = pathTarget.dataset.dropPath;
		if (path) return { path, key: key ?? dropTargetKeyForPath(path), tabId };
	}
	return null;
}
