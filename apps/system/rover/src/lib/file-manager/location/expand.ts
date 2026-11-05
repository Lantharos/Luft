export function expandHome(path: string, home: string) {
	if (path === '~') return home;
	return path.startsWith('~/') ? `${home}${path.slice(1)}` : path;
}
