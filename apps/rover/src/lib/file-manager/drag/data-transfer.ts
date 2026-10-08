import { pathsFromUriList } from '@luft/ui';

const ROVER_PATHS_TYPE = 'application/x-rover-paths';
const PATH_TYPES = ['Files', 'text/uri-list', 'text/plain', ROVER_PATHS_TYPE];

function pathToFileUri(path: string) {
	return `file://${path.split('/').map(encodeURIComponent).join('/')}`;
}

function roverPaths(raw: string): string[] {
	return raw ? JSON.parse(raw) : [];
}

export function dataTransferPaths(dataTransfer: DataTransfer | null) {
	if (!dataTransfer) return [];
	const rover = roverPaths(dataTransfer.getData(ROVER_PATHS_TYPE));
	const paths = rover.length > 0 ? rover : pathsFromUriList(dataTransfer.getData('text/uri-list') || dataTransfer.getData('text/plain'));
	return [...new Set(paths)];
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
