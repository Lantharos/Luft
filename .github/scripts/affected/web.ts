import { readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';

import { Graph } from './graph';

type Package = {
	name: string;
	scripts?: Record<string, string>;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
};

const MODULE = /\.(?:[cm]?[jt]sx?|svelte|astro)$/;
const SOURCE = /\.(?:[cm]?[jt]sx?|svelte|astro|css)$/;
const RELATIVE_IMPORT = /(?:\bfrom\s*|\bimport\s*\(?\s*|@import\s+(?:url\()?)["'](\.\.?\/[^"'?]+)/g;
const INSTALL_FILES = new Set(['package.json', 'bun.lock', '.npmrc']);

export function buildWeb(graph: Graph, files: string[]): string[] {
	const packages = new Map<string, Package>(
		files.filter((file) => file.endsWith('/package.json')).map((file) => [dirname(file), JSON.parse(readFileSync(file, 'utf8')) as Package]),
	);
	const dirsByName = new Map([...packages].map(([dir, pkg]) => [pkg.name, dir]));

	for (const [dir, pkg] of packages) {
		const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
		const workspace = Object.keys(dependencies).filter((name) => dependencies[name].startsWith('workspace:'));
		graph.add(dir, workspace.map((name) => dirsByName.get(name)!));
	}

	for (const file of files.filter((file) => SOURCE.test(file))) {
		const node = graph.owner(file);
		if (!node || !packages.has(node.dir)) continue;
		for (const [, path] of readFileSync(file, 'utf8').matchAll(RELATIVE_IMPORT)) {
			const target = join(dirname(file), path);
			graph.link(node, target, MODULE.test(target) || extname(target) === '');
		}
	}

	return [...packages].filter(([, pkg]) => pkg.scripts?.check).map(([dir]) => dir);
}

export const touchesInstall = (changed: string[]) => changed.some((file) => INSTALL_FILES.has(file));
