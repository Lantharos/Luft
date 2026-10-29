import { readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

import { type Component, MANIFEST, manifestDirs, nestedComponent, parseManifest } from './manifest';

export type Tree = { files: string[]; has: (path: string) => boolean; read: (path: string) => string };

type Dependencies = Record<string, { workspace?: boolean; path?: string } | string>;
type CargoManifest = Record<string, unknown> & { target?: Record<string, Record<string, unknown>> };

const DEPENDENCY_KINDS = ['dependencies', 'dev-dependencies', 'build-dependencies'];
const PACKAGE_KINDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

export function checkoutTree(root: string, files: string[]): Tree {
  const paths = new Set(files.flatMap((file) => file.split('/').map((_, index, parts) => parts.slice(0, index + 1).join('/'))));
  return { files, has: (path) => paths.has(path), read: (path) => readFileSync(join(root, path), 'utf8') };
}

export function listedTree(root: string, listing: string) {
  const objects = new Map(
    listing
      .split('\0')
      .filter(Boolean)
      .map((entry) => {
        const tab = entry.indexOf('\t');
        return [entry.slice(tab + 1), entry.slice(0, tab).split(' ')[2]];
      }),
  );
  return { objects, tree: checkoutTree(root, [...objects.keys()]) };
}

export function components(tree: Tree) {
  return manifestDirs(tree.files).map((dir) => parseManifest(dir, tree.read(join(dir, MANIFEST))));
}

export function partNames(tree: Tree) {
  return [...new Set(components(tree).map((component) => component.part))].sort();
}

function cargoWorkspace(tree: Tree) {
  const { workspace } = Bun.TOML.parse(tree.read('Cargo.toml')) as {
    workspace: { members: string[]; dependencies: Record<string, { path?: string }> };
  };
  const paths = Object.entries(workspace.dependencies).flatMap(([name, spec]) => (spec.path ? [[name, spec.path] as const] : []));
  return { members: workspace.members, paths: new Map(paths) };
}

export function workspacePackages(tree: Tree) {
  const { workspaces } = JSON.parse(tree.read('package.json')) as { workspaces: string[] };
  const globs = workspaces.map((pattern) => new Bun.Glob(`${pattern}/package.json`));
  const manifests = tree.files.filter((file) => globs.some((glob) => glob.match(file)));
  return new Map(manifests.map((file) => [(JSON.parse(tree.read(file)) as { name: string }).name, dirname(file)]));
}

function crateDependencies(tree: Tree, paths: Map<string, string>, crate: string) {
  const manifest = Bun.TOML.parse(tree.read(`${crate}/Cargo.toml`)) as CargoManifest;
  const scopes = [manifest, ...Object.values(manifest.target ?? {})];
  return scopes
    .flatMap((scope) => DEPENDENCY_KINDS.flatMap((kind) => Object.entries((scope[kind] as Dependencies | undefined) ?? {})))
    .flatMap(([name, spec]) => {
      if (typeof spec === 'string') return [];
      if (spec.workspace) return paths.has(name) ? [paths.get(name)!] : [];
      return spec.path ? [normalize(join(crate, spec.path))] : [];
    });
}

function packageDependencies(tree: Tree, packages: Map<string, string>, dir: string) {
  const manifest = JSON.parse(tree.read(`${dir}/package.json`)) as Record<string, Record<string, string> | undefined>;
  return PACKAGE_KINDS.flatMap((kind) => Object.entries(manifest[kind] ?? {}))
    .filter(([, version]) => version.startsWith('workspace:'))
    .map(([name]) => packages.get(name)!);
}

export const within = (path: string, dir: string) => path === dir || path.startsWith(`${dir}/`);

export function fewest(paths: Iterable<string>) {
  const sorted = [...new Set(paths)].sort();
  return sorted.filter((path) => !sorted.some((other) => other !== path && within(path, other)));
}

type Kind = 'crates' | 'packages';

function reach(tree: Tree, component: Component) {
  const cargo = cargoWorkspace(tree);
  const packages = workspacePackages(tree);
  const reached = { crates: new Set<string>(), packages: new Set<string>() };
  let rust = false;
  let web = false;

  const visit = (path: string, kind: Kind) => {
    if (!tree.has(path)) throw new Error(`${component.dir}/${MANIFEST} needs ${path}, which isn't in the tree`);
    if (reached[kind].has(path)) return;
    reached[kind].add(path);
    if (kind === 'crates') {
      for (const crate of cargo.members.filter((member) => within(member, path) && !nestedComponent(member, path, tree.has))) {
        rust = true;
        crateDependencies(tree, cargo.paths, crate).forEach((dependency) => visit(dependency, 'crates'));
      }
    } else if (tree.has(`${path}/package.json`)) {
      web = true;
      packageDependencies(tree, packages, path).forEach((dependency) => visit(dependency, 'packages'));
    }
  };

  for (const path of [component.dir, ...component.sources]) {
    visit(path, 'crates');
    visit(path, 'packages');
  }
  const roots = [...(rust ? ['Cargo.toml', 'Cargo.lock', '.cargo'] : []), ...(web ? ['package.json', 'bun.lock'] : [])];
  return { crates: [...reached.crates], packages: [...reached.packages], roots: roots.filter((path) => tree.has(path)) };
}

export function partReach(tree: Tree, part: string) {
  const reached = components(tree)
    .filter((component) => component.part === part)
    .map((component) => reach(tree, component));
  const crates = fewest(reached.flatMap((each) => each.crates));
  const packages = fewest(reached.flatMap((each) => each.packages));
  return { crates, packages, sources: fewest([...crates, ...packages, ...reached.flatMap((each) => each.roots)]) };
}

export function partSources(tree: Tree, part: string) {
  return partReach(tree, part).sources;
}
