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
