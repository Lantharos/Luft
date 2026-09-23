import { appWindow, isAvailable } from '@lantharos/sabine';

export function isDesktopRuntime() {
	return typeof window !== 'undefined' && (isAvailable() || new URLSearchParams(window.location.search).has('sabine'));
}

export function fileSource(path: string) {
	if (!path.startsWith('/')) return path;
	return `file://${path.split('/').map(encodeURIComponent).join('/')}`;
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

export function startWindowDrag() {
	if (isDesktopRuntime()) appWindow.startDrag();
}
