import { basename } from 'node:path';

export type Node = {
	dir: string;
	deps: Set<string>;
	paths: Set<string>;
};

const IGNORED_FILES = new Set(['README.md', 'LICENSE']);

export const covers = (path: string, file: string) => file === path || file.startsWith(`${path}/`) || file.startsWith(`${path}.`);

export const within = (dir: string, file: string) => dir === '.' || file.startsWith(`${dir}/`);

export class Graph {
	private readonly nodes = new Map<string, Node>();
	private byDepth: Node[] = [];

	add(dir: string, deps: Iterable<string>): Node {
		const existing = this.nodes.get(dir);
		if (existing) {
			for (const dep of deps) existing.deps.add(dep);
			return existing;
		}
		const node = { dir, deps: new Set(deps), paths: new Set<string>() };
		this.nodes.set(dir, node);
		this.byDepth = [...this.nodes.values()].sort((a, b) => b.dir.length - a.dir.length);
		return node;
	}

	owner(file: string): Node | undefined {
		return this.byDepth.find((node) => within(node.dir, file));
	}

	link(node: Node, target: string, followOwner: boolean) {
		const owner = this.owner(target);
		if (owner === node) {
			if (IGNORED_FILES.has(basename(target))) node.paths.add(target);
		} else if (owner && followOwner) {
			node.deps.add(owner.dir);
		} else {
			node.paths.add(target);
		}
	}

	affected(changed: string[]): Set<string> {
		const touched = new Set<string>();
		for (const file of changed) {
			const owner = this.owner(file);
			if (owner && !IGNORED_FILES.has(basename(file))) touched.add(owner.dir);
		}
		for (const node of this.nodes.values()) {
			if ([...node.paths].some((path) => changed.some((file) => covers(path, file)))) touched.add(node.dir);
		}

		const memo = new Map<string, boolean>();
		const visit = (dir: string): boolean => {
			const known = memo.get(dir);
			if (known !== undefined) return known;
			memo.set(dir, false);
			const result = touched.has(dir) || [...(this.nodes.get(dir)?.deps ?? [])].some(visit);
			memo.set(dir, result);
			return result;
		};
		return new Set([...this.nodes.keys()].filter(visit));
	}
}
