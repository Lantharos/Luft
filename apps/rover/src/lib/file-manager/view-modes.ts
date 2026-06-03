import type { DriveInfo, Settings, SidebarView, UserDirs, ViewMode } from '$lib/types';

export function normalizePath(path: string) {
	if (!path || path === '/') return '/';
	return path.replace(/\/+$/, '');
}

export function isDrivePath(path: string, drives: DriveInfo[]) {
	const normalized = normalizePath(path);

	return drives.some((drive) => {
		const mount = normalizePath(drive.mount_point);
		if (mount === '/') return normalized === '/';
		return normalized === mount || normalized.startsWith(`${mount}/`);
	});
}

export function sidebarViewForPath(currentView: SidebarView, currentPath: string, drives: DriveInfo[]): SidebarView | null {
	if (currentView === 'favorites' || currentView === 'trash' || currentView === 'drives') return currentView;
	if (isDrivePath(currentPath, drives)) return 'drives';
	return null;
}

export function defaultViewModeForPath(path: string, dirs: UserDirs | null): ViewMode {
	const normalized = normalizePath(path);
	if (dirs?.pictures && normalized === normalizePath(dirs.pictures)) return 'grid';
	if (dirs?.videos && normalized === normalizePath(dirs.videos)) return 'grid';
	return 'list';
}

export function viewModeForPath(path: string, appSettings: Settings, dirs: UserDirs | null): ViewMode {
	return appSettings.folderViewModes[normalizePath(path)] ?? defaultViewModeForPath(path, dirs);
}
