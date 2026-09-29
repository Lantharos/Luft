import * as api from '$lib/api';
import type { IconName } from '$lib/components/Icon.svelte';
import { isDesktopRuntime } from '$lib/runtime';
import type { Operation, UserDirs } from '$lib/types';
import { basename } from '$lib/utils/paths';
import { previewTrash } from '../preview';

export type Place = { path: string; label: string; icon: IconName };

const USER_FOLDERS: { key: Exclude<keyof UserDirs, 'home'>; icon: IconName }[] = [
	{ key: 'desktop', icon: 'monitor' },
	{ key: 'documents', icon: 'file-text' },
	{ key: 'downloads', icon: 'download' },
	{ key: 'music', icon: 'music' },
	{ key: 'pictures', icon: 'image' },
	{ key: 'videos', icon: 'video' }
];

export function userFolders(dirs: UserDirs | null): Place[] {
	if (!dirs) return [];
	return USER_FOLDERS.flatMap(({ key, icon }) => {
		const path = dirs[key];
		return path && path !== dirs.home ? [{ path, label: basename(path), icon }] : [];
	});
}

export class TrashCounter {
	count = $state(0);
	#settled = new Set<string>();

	refresh = async () => {
		if (!isDesktopRuntime()) return void (this.count = previewTrash.length);
		this.count = await api.trashCount().catch(() => this.count);
	};

	receiveOperations = (operations: Operation[]) => {
		const settled = operations.filter((operation) => operation.completed_at !== null).map((operation) => operation.id);
		const fresh = settled.some((id) => !this.#settled.has(id));
		this.#settled = new Set(settled);
		if (fresh) void this.refresh();
	};
}
