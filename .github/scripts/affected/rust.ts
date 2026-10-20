import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { Glob } from 'bun';

import { Graph, within } from './graph';

type Table = Record<string, unknown>;
type Manifest = Table & {
	package?: Table;
	target?: Record<string, Table>;
	patch?: Record<string, Table>;
	workspace?: { members?: string[]; exclude?: string[]; 'default-members'?: string[]; dependencies?: Table };
};

export type Crate = {
	dir: string;
	members: string[];
	checksOnLinux: boolean;
	targetsUefi: boolean;
	targetsWindows: boolean;
};

const DEPENDENCY_KINDS = ['dependencies', 'dev-dependencies', 'build-dependencies'];
const INCLUDE = /include_(?:str|bytes)!\(\s*"([^"]+)"/g;
const CARGO_CONFIG = /(?:^|\/)\.cargo\/config(?:\.toml)?$/;

function packageTables(manifest: Manifest): Table[] {
	const scopes: Table[] = [manifest, ...Object.values(manifest.target ?? {})];
	return scopes.flatMap((scope) => DEPENDENCY_KINDS.map((kind) => scope[kind] as Table | undefined)).filter((table) => table !== undefined);
}

function pathDependencies(dir: string, tables: Table[]): string[] {
	return tables
		.flatMap((table) => Object.values(table))
		.flatMap((spec) => (typeof spec === 'object' && spec !== null && 'path' in spec ? [join(dir, String(spec.path))] : []));
}

function expandMembers(root: string, patterns: string[], packageDirs: string[]): string[] {
	const globs = patterns.map((pattern) => new Glob(join(root, pattern)));
	return packageDirs.filter((dir) => globs.some((glob) => glob.match(dir)));
}

export function buildRust(graph: Graph, files: string[]) {
	const manifests = new Map<string, Manifest>(
		files.filter((file) => file === 'Cargo.toml' || file.endsWith('/Cargo.toml')).map((file) => [dirname(file), Bun.TOML.parse(readFileSync(file, 'utf8')) as Manifest]),
	);
	const dirs = [...manifests.keys()];

	const rootOf = new Map<string, string>();
	const crates: Crate[] = [];
	for (const [dir, manifest] of manifests) {
		if (!manifest.workspace) continue;
		const excluded = new Set(expandMembers(dir, manifest.workspace.exclude ?? [], dirs));
		const members = expandMembers(dir, manifest.workspace.members ?? [], dirs).filter((member) => !excluded.has(member));
		for (const member of members) rootOf.set(member, dir);
		const packages = manifest.package ? [dir, ...members] : members;
		const defaults = manifest.workspace['default-members'];
		crates.push(classify(dir, [dir, ...members], defaults ? expandMembers(dir, defaults, dirs) : packages, manifests));
	}
	for (const dir of dirs) {
		if (!manifests.get(dir)!.workspace && !rootOf.has(dir)) crates.push(classify(dir, [dir], [dir], manifests));
	}

	for (const [dir, manifest] of manifests) {
		const root = rootOf.get(dir);
		const node = graph.add(dir, pathDependencies(dir, [...packageTables(manifest), ...Object.values(manifest.patch ?? {})]));
		const workspace = root ? manifests.get(root)!.workspace : manifest.workspace;
		for (const dep of pathDependencies(root ?? dir, workspace?.dependencies ? [workspace.dependencies] : [])) node.deps.add(dep);
		if (root) node.paths.add(join(root, 'Cargo.toml'));
		node.deps.delete(dir);
	}

	for (const file of files.filter((file) => file.endsWith('.rs'))) {
		const node = graph.owner(file);
		if (!node || !manifests.has(node.dir)) continue;
		for (const [, path] of readFileSync(file, 'utf8').matchAll(INCLUDE)) graph.link(node, join(dirname(file), path), false);
	}

	return crates;
}

function classify(dir: string, members: string[], defaults: string[], manifests: Map<string, Manifest>): Crate {
	const usesUefi = (member: string) => packageTables(manifests.get(member)!).some((table) => 'uefi' in table);
	return {
		dir,
		members,
		checksOnLinux: defaults.some((member) => !usesUefi(member)),
		targetsUefi: members.some(usesUefi),
		targetsWindows: members.some((member) => Object.keys(manifests.get(member)!.target ?? {}).some((cfg) => cfg.includes('windows'))),
	};
}

export function affectedCrates(crates: Crate[], affected: Set<string>, changed: string[]): Crate[] {
	const configs = changed.filter((file) => CARGO_CONFIG.test(file)).map((file) => dirname(dirname(file)));
	return crates.filter((crate) => crate.members.some((member) => affected.has(member)) || configs.some((dir) => within(dir, crate.dir)));
}
