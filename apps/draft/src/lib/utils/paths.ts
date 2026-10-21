import { isInside } from '@luft/ui';

export function tildify(path: string, home: string) {
	return isInside(path, home) ? `~${path.slice(home.length)}` : path;
}
