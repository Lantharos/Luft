export function basename(path: string) {
	return path.split('/').filter(Boolean).at(-1) ?? path;
}

export function isInside(path: string, folder: string) {
	const base = folder.replace(/\/+$/, '');
	return path === (base || '/') || path.startsWith(`${base}/`);
}

export function fileUrlPath(value: string) {
	const url = URL.parse(value.trim());
	return url?.protocol === 'file:' ? decodeURIComponent(url.pathname) : null;
}

export function pathsFromUriList(list: string) {
	return list
		.split(/\r?\n/)
		.filter((line) => line && !line.startsWith('#'))
		.map(fileUrlPath)
		.filter((path) => path !== null);
}
