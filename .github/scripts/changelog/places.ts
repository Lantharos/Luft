import { git } from '../affected/range';
import type { Place } from './sections';

const UNSEEN = [
	/^\.github\//,
	/^docs\//,
	/^web\//,
	/^os\/dev\//,
	/^kestrel\/(tools|peek)\//,
	/^os\/image\/(build|throwaway-keys)\.sh$/,
	/^os\/image\/parts\/(key\.ts|stages\/workspace)/,
	/(^|\/)(vm|tests?)(\/|\.rs$)/,
	/\.(test|spec)\.[cm]?[jt]s$/,
	/\.md$/,
];

const DESKTOP: Place = { area: 'desktop', title: 'Desktop' };
const SYSTEM: Place = { area: 'system', title: 'System' };
const INSTALLING: Place = { area: 'installing', title: 'Installing' };

const appNames = new Map<string, string>();

function app(folder: string): Place {
	if (!appNames.has(folder)) {
		const manifest = git('show', `HEAD:apps/${folder}/Sabine.toml`) ?? '';
		appNames.set(folder, /^name = "([^"]+)"$/m.exec(manifest)?.[1] ?? folder);
	}
	return { area: 'apps', title: appNames.get(folder)! };
}

export function place(path: string): Place | undefined {
	if (UNSEEN.some((pattern) => pattern.test(path))) return undefined;
	if (path.startsWith('kestrel/')) return DESKTOP;
	if (/^(apps\/(setup|meet)|os\/iso)\//.test(path)) return INSTALLING;
	const folder = /^apps\/([^/]+)\//.exec(path)?.[1];
	if (folder) return app(folder);
	if (path.startsWith('os/image/parts/helium/')) return { area: 'apps', title: 'Helium' };
	if (/^(services|security|os|boot|packages)\//.test(path) || path === 'Cargo.toml') return SYSTEM;
	return undefined;
}
