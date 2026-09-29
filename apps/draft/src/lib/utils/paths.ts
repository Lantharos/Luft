export function basename(path: string) {
	return path.slice(path.lastIndexOf('/') + 1);
}

export function dirname(path: string) {
	const index = path.lastIndexOf('/');
	return index <= 0 ? '/' : path.slice(0, index);
}

export function join(folder: string, name: string) {
	return folder.endsWith('/') ? folder + name : `${folder}/${name}`;
}

export function isInside(path: string, folder: string) {
	return path.startsWith(folder.endsWith('/') ? folder : `${folder}/`);
}

export function tildify(path: string, home: string) {
	return path === home || isInside(path, home) ? `~${path.slice(home.length)}` : path;
}
