const ROVER_PATHS_TYPE = 'application/x-rover-paths';
const PATH_TYPES = ['Files', 'text/uri-list', 'text/plain', ROVER_PATHS_TYPE];

function pathToFileUri(path: string) {
	return `file://${path.split('/').map(encodeURIComponent).join('/')}`;
}

function fileUriToPath(value: string) {
	try {
		const url = new URL(value.trim());
		return url.protocol === 'file:' ? decodeURIComponent(url.pathname) : null;
	} catch {
		return value.startsWith('/') ? value.trim() : null;
	}
}

function roverPaths(raw: string): string[] {
	return raw ? JSON.parse(raw) : [];
}

function uriListPaths(raw: string) {
	return raw
		.split(/\r?\n/)
		.filter((line) => line && !line.startsWith('#'))
		.map(fileUriToPath)
		.filter((path): path is string => Boolean(path));
}

export function dataTransferPaths(dataTransfer: DataTransfer | null) {
	if (!dataTransfer) return [];
	const rover = roverPaths(dataTransfer.getData(ROVER_PATHS_TYPE));
	const paths = rover.length > 0 ? rover : uriListPaths(dataTransfer.getData('text/uri-list') || dataTransfer.getData('text/plain'));
	return [...new Set(paths.filter((path) => path.startsWith('/')))];
}

export function dataTransferHasPaths(dataTransfer: DataTransfer | null) {
	return Boolean(dataTransfer && PATH_TYPES.some((type) => dataTransfer.types.includes(type)));
}

export function setFileDragData(dataTransfer: DataTransfer | null, paths: string[]) {
	if (!dataTransfer) return;
	const uriList = paths.map(pathToFileUri).join('\r\n');
	dataTransfer.setData(ROVER_PATHS_TYPE, JSON.stringify(paths));
	dataTransfer.setData('text/uri-list', uriList);
	dataTransfer.setData('text/plain', uriList);
	dataTransfer.effectAllowed = 'copyMove';
}
