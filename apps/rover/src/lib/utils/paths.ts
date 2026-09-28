export function basename(path: string) {
	return path.split('/').filter(Boolean).at(-1) ?? path;
}

export function trimTrailingSlash(path: string) {
	return path === '/' ? path : path.replace(/\/+$/, '') || '/';
}

export function parentPath(path: string) {
	const trimmed = trimTrailingSlash(path);
	const lastSlash = trimmed.lastIndexOf('/');
	return lastSlash <= 0 ? '/' : trimmed.slice(0, lastSlash);
}

export function joinPath(folder: string, name: string) {
	return `${folder.replace(/\/+$/, '')}/${name.replace(/^\/+/, '')}`;
}

export function isInside(path: string, folder: string) {
	const base = trimTrailingSlash(folder);
	return path === base || path.startsWith(base === '/' ? '/' : `${base}/`);
}

export function pathSegments(path: string) {
	const segments: { name: string; path: string }[] = [];
	let current = '';
	for (const part of path.split('/').filter(Boolean)) {
		current += `/${part}`;
		segments.push({ name: part, path: current });
	}
	return segments;
}

export function relativePath(root: string, path: string) {
	const base = trimTrailingSlash(root);
	return path.startsWith(`${base}/`) ? path.slice(base.length + 1) : path;
}

export function absolutePath(root: string, path: string) {
	return path.startsWith('/') ? path : joinPath(root, path);
}
