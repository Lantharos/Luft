import type { Settings, UserDirs, ViewMode } from '$lib/types';
import { trimTrailingSlash } from '$lib/utils/paths';

const GALLERY_DIRS: (keyof UserDirs)[] = ['pictures', 'videos'];

export function viewModeForPath(path: string, appSettings: Settings, dirs: UserDirs | null): ViewMode {
	const normalized = trimTrailingSlash(path);
	const saved = appSettings.folderViewModes[normalized];
	if (saved) return saved;
	return GALLERY_DIRS.some((key) => dirs?.[key] && trimTrailingSlash(dirs[key]) === normalized) ? 'grid' : 'list';
}
