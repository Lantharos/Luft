type FileWithPath = File & { path?: string };

const ROVER_PATHS_TYPE = 'application/x-rover-paths';

function uniquePaths(paths: string[]) {
	return [...new Set(paths.filter((path) => path.startsWith('/')))];
}

function pathToFileUri(path: string) {
	return `file://${path.split('/').map(encodeURIComponent).join('/')}`;
}

function fileUriToPath(value: string) {
	const trimmed = value.trim();
	if (trimmed.startsWith('file://localhost/')) return decodeURIComponent(trimmed.slice('file://localhost'.length));
	if (trimmed.startsWith('file://')) return decodeURIComponent(trimmed.slice('file://'.length));
	return trimmed;
}

function parsePathPayload(raw: string) {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string');
	} catch {
		return raw
			.split(/\r?\n/)
			.map(fileUriToPath)
			.filter(Boolean);
	}
	return [];
}

export function dataTransferPaths(dataTransfer: DataTransfer | null) {
	if (!dataTransfer) return [];

	const paths = [
		...parsePathPayload(dataTransfer.getData(ROVER_PATHS_TYPE)),
		...parsePathPayload(dataTransfer.getData('text/plain')),
		...parsePathPayload(dataTransfer.getData('text/uri-list')),
		...Array.from(dataTransfer.files).map((file) => (file as FileWithPath).path ?? '')
	];

	return uniquePaths(paths);
}

export function dataTransferHasPaths(dataTransfer: DataTransfer | null) {
	if (!dataTransfer) return false;
	const types = Array.from(dataTransfer.types);
	return ['Files', 'text/uri-list', 'text/plain', ROVER_PATHS_TYPE].some((type) => types.includes(type));
}

export function setFileDragData(dataTransfer: DataTransfer | null, paths: string[]) {
	if (!dataTransfer) return;
	const unique = uniquePaths(paths);
	const uriList = unique.map(pathToFileUri).join('\r\n');
	dataTransfer.setData(ROVER_PATHS_TYPE, JSON.stringify(unique));
	dataTransfer.setData('text/uri-list', uriList);
	dataTransfer.setData('text/plain', uriList);
	dataTransfer.effectAllowed = 'copyMove';
}
