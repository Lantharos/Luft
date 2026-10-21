import { join } from '@luft/ui';

export function trimTrailingSlash(path: string) {
	return path === '/' ? path : path.replace(/\/+$/, '') || '/';
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
	return path.startsWith('/') ? path : join(root, path);
}
