import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { lockedPackages } from '../../../os/image/parts/stages/workspace';
import { Graph } from './graph';
import { git } from './range';

type Table = Record<string, unknown>;
type Manifest = Table & {
	package?: { name: string };
	target?: Record<string, Table>;
	workspace?: { members: string[]; dependencies: Record<string, Table | string> };
};

export type Crate = {
	dir: string;
	name: string;
	inherits: string[];
	targetsUefi: boolean;
	targetsWindows: boolean;
	buildsOnSabine: boolean;
};

const DEPENDENCY_KINDS = ['dependencies', 'dev-dependencies', 'build-dependencies'];
const INCLUDE = /include_(?:str|bytes)!\(\s*"([^"]+)"/g;
const WORKSPACE_LISTS = ['members', 'default-members', 'dependencies'];

const parse = (text: string) => Bun.TOML.parse(text) as Manifest;

function dependencyNames(manifest: Manifest): string[] {
	const scopes: Table[] = [manifest, ...Object.values(manifest.target ?? {})];
	return scopes.flatMap((scope) => DEPENDENCY_KINDS.flatMap((kind) => Object.keys((scope[kind] as Table | undefined) ?? {})));
}

export function buildRust(graph: Graph, files: string[]): Crate[] {
	const root = parse(readFileSync('Cargo.toml', 'utf8'));
	const paths = new Map(
		Object.entries(root.workspace!.dependencies).flatMap(([name, spec]) => (typeof spec === 'object' && 'path' in spec ? [[name, String(spec.path)]] : [])),
	);

	const lock = readFileSync('Cargo.lock', 'utf8');
	const crates = root.workspace!.members.map((dir) => {
		const manifest = parse(readFileSync(join(dir, 'Cargo.toml'), 'utf8'));
		const inherits = dependencyNames(manifest);
		graph.add(dir, inherits.flatMap((name) => paths.get(name) ?? []));
		return {
			dir,
			name: manifest.package!.name,
			inherits,
			targetsUefi: inherits.includes('uefi'),
			targetsWindows: Object.keys(manifest.target ?? {}).some((cfg) => cfg.includes('windows')),
			buildsOnSabine: [...lockedPackages(lock, [manifest.package!.name])].some((id) => id.startsWith('sabine ')),
		};
	});

	for (const file of files.filter((file) => file.endsWith('.rs'))) {
		const node = graph.owner(file);
		if (!node || !crates.some((crate) => crate.dir === node.dir)) continue;
		for (const [, path] of readFileSync(file, 'utf8').matchAll(INCLUDE)) graph.link(node, join(dirname(file), path), false);
	}

	for (const sabine of files.filter((file) => basename(file) === 'Sabine.toml')) {
		const app = Bun.TOML.parse(readFileSync(sabine, 'utf8')) as { app?: { cargo_manifest?: string }; bindings?: { path: string } };
		const node = app.bindings && graph.owner(join(dirname(sabine), app.app?.cargo_manifest ?? 'Cargo.toml'));
		if (node) graph.link(node, join(dirname(sabine), app.bindings!.path), false);
	}

	return crates;
}

function settings(manifest: Manifest) {
	const workspace = Object.fromEntries(Object.entries(manifest.workspace ?? {}).filter(([key]) => !WORKSPACE_LISTS.includes(key)));
	return JSON.stringify({ ...manifest, workspace });
}

export function workspaceChanges(crates: Crate[], changed: string[], base: string): string[] {
	if (changed.includes('.cargo/config.toml')) return crates.map((crate) => `${crate.dir}/Cargo.toml`);
	if (!changed.includes('Cargo.toml') && !changed.includes('Cargo.lock')) return [];

	const manifestBefore = git('show', `${base}:Cargo.toml`);
	const lockBefore = git('show', `${base}:Cargo.lock`);
	const manifest = parse(readFileSync('Cargo.toml', 'utf8'));
	const lock = readFileSync('Cargo.lock', 'utf8');
	const before = manifestBefore && parse(manifestBefore);
	if (!before || !lockBefore || settings(before) !== settings(manifest)) return crates.map((crate) => `${crate.dir}/Cargo.toml`);

	const specs = (from: Manifest) => from.workspace!.dependencies;
	const changedDependencies = new Set(
		Object.keys({ ...specs(before), ...specs(manifest) }).filter((name) => JSON.stringify(specs(before)[name]) !== JSON.stringify(specs(manifest)[name])),
	);
	const sameLocked = (name: string) => {
		const was = lockedPackages(lockBefore, [name]);
		const is = lockedPackages(lock, [name]);
		return was.size === is.size && [...is].every((id) => was.has(id));
	};
	return crates
		.filter((crate) => crate.inherits.some((name) => changedDependencies.has(name)) || !sameLocked(crate.name))
		.map((crate) => `${crate.dir}/Cargo.toml`);
}

export const packageArguments = (crates: Crate[]) => crates.map((crate) => `-p ${crate.name}`).join(' ');
