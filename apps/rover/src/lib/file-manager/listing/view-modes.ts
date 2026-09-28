import type { DriveInfo, Settings, UserDirs, ViewMode } from '$lib/types';
import { isInside, trimTrailingSlash } from '$lib/utils/paths';

const GALLERY_DIRS: (keyof UserDirs)[] = ['pictures', 'videos'];

export function isDrivePath(path: string, drives: DriveInfo[]) {
	return drives.some((drive) => (drive.mount_point === '/' ? path === '/' : isInside(path, drive.mount_point)));
}

export function viewModeForPath(path: string, appSettings: Settings, dirs: UserDirs | null): ViewMode {
	const normalized = trimTrailingSlash(path);
	const saved = appSettings.folderViewModes[normalized];
	if (saved) return saved;
	return GALLERY_DIRS.some((key) => dirs?.[key] && trimTrailingSlash(dirs[key]) === normalized) ? 'grid' : 'list';
}
