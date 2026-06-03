type FileWithPath = File & { path?: string };

function uniquePaths(paths: string[]) {
	return [...new Set(paths.filter((path) => path.startsWith('/')))];
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
		...parsePathPayload(dataTransfer.getData('text/plain')),
		...parsePathPayload(dataTransfer.getData('text/uri-list')),
		...Array.from(dataTransfer.files).map((file) => (file as FileWithPath).path ?? '')
	];

	return uniquePaths(paths);
}
