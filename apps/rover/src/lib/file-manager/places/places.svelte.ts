import Download from '@lucide/svelte/icons/download';
import FileText from '@lucide/svelte/icons/file-text';
import Image from '@lucide/svelte/icons/image';
import Monitor from '@lucide/svelte/icons/monitor';
import Music from '@lucide/svelte/icons/music';
import Video from '@lucide/svelte/icons/video';
import { basename } from '@luft/ui';
import type { Component } from 'svelte';
import * as api from '#lib/api.js';
import type { Operation, UserDirs } from '#lib/types/index.js';

export type Place = { path: string; label: string; icon: Component };

const USER_FOLDERS: { key: Exclude<keyof UserDirs, 'home'>; icon: Component }[] = [
	{ key: 'desktop', icon: Monitor },
	{ key: 'documents', icon: FileText },
	{ key: 'downloads', icon: Download },
	{ key: 'music', icon: Music },
	{ key: 'pictures', icon: Image },
	{ key: 'videos', icon: Video }
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
		this.count = await api.trashCount().catch(() => this.count);
	};

	receiveOperations = (operations: Operation[]) => {
		const settled = operations.filter((operation) => operation.completed_at !== null).map((operation) => operation.id);
		const fresh = settled.some((id) => !this.#settled.has(id));
		this.#settled = new Set(settled);
		if (fresh) void this.refresh();
	};
}
