export type DropTarget = {
	path: string;
	key: string;
};

export const TRASH_DROP_PATH = 'trash';

export function dropKey(scope: string, path: string) {
	return `${scope}:${path}`;
}

export function tabDropKey(id: string) {
	return dropKey('tab', id);
}
