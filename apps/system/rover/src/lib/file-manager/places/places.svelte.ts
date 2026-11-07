import { basename } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import type { Operation, UserDirs } from '#lib/bindings.js';
import { USER_FOLDER_ICONS, type UserFolder } from '#lib/features/looks/catalogue.js';

export type Place = { path: string; label: string; icon: string };

export function userFolders(dirs: UserDirs | null): Place[] {
	if (!dirs) return [];
	return Object.entries(USER_FOLDER_ICONS).flatMap(([key, icon]) => {
		const path = dirs[key as UserFolder];
		return path && path !== dirs.home ? [{ path, label: basename(path), icon }] : [];
	});
}

export function mainPlaces(dirs: UserDirs | null): Place[] {
	return dirs ? [{ path: dirs.home, label: 'Home', icon: 'house' }, ...userFolders(dirs)] : [];
}

export class TrashCounter {
	count = $state(0);
	#settled = new Set<string>();

	refresh = async () => {
		this.count = await commands.trashCount().catch(() => this.count);
	};

	receiveOperations = (operations: Operation[]) => {
		const settled = operations.filter((operation) => operation.completedAt !== null).map((operation) => operation.id);
		const fresh = settled.some((id) => !this.#settled.has(id));
		this.#settled = new Set(settled);
		if (fresh) void this.refresh();
	};
}
