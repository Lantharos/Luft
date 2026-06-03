export function isDesktopRuntime() {
	return typeof window !== 'undefined' && (Boolean(window.fenestra?.bridge) || new URLSearchParams(window.location.search).has('fenestra'));
}

export function fileSource(path: string) {
	if (!path.startsWith('/')) return path;
	return `file://${path.split('/').map(encodeURIComponent).join('/')}`;
}

export function minimizeWindow() {
	controlWindow('minimize');
}

export function toggleMaximizeWindow() {
	controlWindow('maximize');
}

export function closeWindow() {
	controlWindow('close');
}

export function startWindowDrag() {
	if (!isDesktopRuntime()) return;
	window.location.href = `fenestra://window/start-drag?at=${Date.now()}`;
}

function controlWindow(action: 'close' | 'minimize' | 'maximize') {
	if (!isDesktopRuntime()) return;
	window.location.href = `fenestra://window/${action}`;
}
