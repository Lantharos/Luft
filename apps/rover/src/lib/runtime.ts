import { appWindow, fileUrl, isAvailable } from '@lantharos/sabine';

export const isDesktopRuntime = isAvailable;

export function localFileSource(path: string, modified: number | null) {
	return `${fileUrl(path)}?v=${modified ?? 0}`;
}

export function minimizeWindow() {
	if (isDesktopRuntime()) appWindow.minimize();
}

export function toggleMaximizeWindow() {
	if (isDesktopRuntime()) appWindow.toggleMaximize();
}

export function closeWindow() {
	if (isDesktopRuntime()) appWindow.close();
}
