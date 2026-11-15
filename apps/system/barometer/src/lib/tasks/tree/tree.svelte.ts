import { resolved, t } from '@luft/i18n';
import type { AppInfo, Entry, Group, Window } from '#lib/bindings.js';
import type { Process } from '#lib/bridge/rows.js';
import type { Sort } from '#lib/state/settings.svelte.js';
import { compare, type Row } from '../columns';
import { matches } from '../search';
import { Node, type Kind } from './node.svelte';

export interface Input {
	entries: Entry[];
	processes: Process[];
	owners: Map<string, AppInfo>;
	sort: Sort;
	query: string;
	expanded: readonly string[];
	collapsed: ReadonlySet<Group>;
	flat: boolean;
	stopping: ReadonlySet<string>;
}

interface Shown {
	entry: Entry;
	row: Row;
	found: Process[] | null;
}

const groups = resolved((): { id: Group; title: string }[] => [
	{ id: 'apps', title: t('barometer-group-apps') },
	{ id: 'background', title: t('barometer-group-background') },
	{ id: 'system', title: t('barometer-group-system') }
]);

const rowOf = (entry: Entry): Row => ({ ...entry, nice: 0, state: entry.paused ? 'T' : 'S', userTime: 0, systemTime: 0 });

export class TaskTree {
	items = $state.raw<Node[]>([]);

	#nodes = new Map<string, Node>();
	#used = new Set<string>();

	update(input: Input) {
		this.#used.clear();
		const next = input.flat ? this.#flat(input) : this.#grouped(input);
		for (const key of this.#nodes.keys()) if (!this.#used.has(key)) this.#nodes.delete(key);
		if (next.length !== this.items.length || next.some((node, index) => node !== this.items[index])) this.items = next;
	}

	find(key: string) {
		return this.#nodes.get(key);
	}

	#take(key: string, kind: Kind) {
		let node = this.#nodes.get(key);
		if (!node) {
			node = new Node(key, kind);
			this.#nodes.set(key, node);
		}
		this.#used.add(key);
		return node;
	}

	#flat({ processes, owners, query, sort }: Input) {
		const owner = (process: Process) => owners.get(process.app ?? '');
		return processes
			.filter((process) => matches(process, query, owner(process)?.name))
			.sort(compare(sort))
			.map((process) => this.#process(process, null, owner(process)?.icon ?? null));
	}

	#grouped(input: Input) {
		const order = compare(input.sort);
		const children = Map.groupBy(input.processes, (process) => process.app ?? '');
		const needle = input.query.trim().toLowerCase();
		const items: Node[] = [];
		for (const { id, title } of groups()) {
			const shown: Shown[] = [];
			for (const entry of input.entries) {
				if (entry.group !== id) continue;
				const named = !needle || entry.name.toLowerCase().includes(needle);
				const found = named ? null : (children.get(entry.key) ?? []).filter((process) => matches(process, input.query));
				if (named || found?.length) shown.push({ entry, row: rowOf(entry), found });
			}
			if (!shown.length) continue;
			const heading = this.#take(`group:${id}`, 'group');
			heading.title = title;
			heading.group = id;
			heading.expanded = needle !== '' || !input.collapsed.has(id);
			items.push(heading);
			if (!heading.expanded) continue;
			shown.sort((a, b) => order(a.row, b.row));
			for (const { entry, row, found } of shown) {
				const node = this.#entry(entry, row, heading, input.stopping);
				node.expanded = found !== null || input.expanded.includes(entry.key);
				items.push(node);
				if (!node.expanded) continue;
				entry.windows.forEach((window, index) => items.push(this.#window(entry, window, index, node)));
				for (const process of (found ?? children.get(entry.key) ?? []).sort(order)) items.push(this.#process(process, node, entry.icon));
			}
		}
		return items;
	}

	#entry(entry: Entry, row: Row, parent: Node, stopping: ReadonlySet<string>) {
		const node = this.#take(`entry:${entry.key}`, 'entry');
		const ending = stopping.has(entry.key);
		node.title = entry.name;
		node.icon = entry.icon;
		node.app = entry.key;
		node.row = row;
		node.entry = entry;
		node.count = entry.processes;
		node.parent = parent;
		node.group = entry.group;
		node.working = ending;
		node.note = ending ? 'stopping' : !entry.responding ? 'unresponsive' : entry.paused ? 'paused' : undefined;
		return node;
	}

	#window(entry: Entry, window: Window, index: number, parent: Node) {
		const node = this.#take(`window:${entry.key}:${index}`, 'window');
		node.title = window.title || entry.name;
		node.icon = entry.icon;
		node.app = entry.key;
		node.entry = entry;
		node.child = true;
		node.parent = parent;
		node.note = window.responding ? undefined : 'unresponsive';
		return node;
	}

	#process(process: Process, parent: Node | null, icon: string | null) {
		const node = this.#take(`pid:${process.pid}`, 'process');
		node.title = process.name;
		node.icon = icon;
		node.app = process.app;
		node.row = process;
		node.process = process;
		node.child = parent !== null;
		node.parent = parent;
		node.note = process.state === 'T' ? 'paused' : undefined;
		return node;
	}
}
