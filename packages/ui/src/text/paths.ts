export function basename(path: string) {
	return path.split('/').filter(Boolean).at(-1) ?? path;
}

export function isInside(path: string, folder: string) {
	const base = folder.replace(/\/+$/, '');
	return path === (base || '/') || path.startsWith(`${base}/`);
}
