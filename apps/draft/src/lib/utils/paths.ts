import { isInside } from '@luft/ui';

export function dirname(path: string) {
	const index = path.lastIndexOf('/');
	return index <= 0 ? '/' : path.slice(0, index);
}

export function join(folder: string, name: string) {
	return folder.endsWith('/') ? folder + name : `${folder}/${name}`;
}

export function tildify(path: string, home: string) {
	return isInside(path, home) ? `~${path.slice(home.length)}` : path;
}
