import type { TerminalSession } from '$lib/terminal/session.svelte';

export type Direction = 'row' | 'column';

export interface PaneNode {
	kind: 'pane';
	session: TerminalSession;
}

export interface SplitNode {
	kind: 'split';
	direction: Direction;
	ratio: number;
	first: LayoutNode;
	second: LayoutNode;
}

export type LayoutNode = PaneNode | SplitNode;

export const pane = (session: TerminalSession): PaneNode => ({ kind: 'pane', session });

export function sessions(node: LayoutNode): TerminalSession[] {
	return node.kind === 'pane' ? [node.session] : [...sessions(node.first), ...sessions(node.second)];
}

export function split(node: LayoutNode, target: TerminalSession, added: TerminalSession, direction: Direction): LayoutNode {
	if (node.kind === 'pane') {
		return node.session === target ? { kind: 'split', direction, ratio: 0.5, first: node, second: pane(added) } : node;
	}
	return { ...node, first: split(node.first, target, added, direction), second: split(node.second, target, added, direction) };
}

export function remove(node: LayoutNode, target: TerminalSession): LayoutNode | null {
	if (node.kind === 'pane') return node.session === target ? null : node;
	const first = remove(node.first, target);
	const second = remove(node.second, target);
	if (!first) return second;
	if (!second) return first;
	return { ...node, first, second };
}

type Vector = [number, number];

const DIRECTIONS: Record<string, Vector> = {
	ArrowLeft: [-1, 0],
	ArrowRight: [1, 0],
	ArrowUp: [0, -1],
	ArrowDown: [0, 1]
};

export function neighbor(candidates: TerminalSession[], from: TerminalSession, key: string) {
	const [dx, dy] = DIRECTIONS[key];
	const center = (session: TerminalSession) => {
		const box = session.host.getBoundingClientRect();
		return [box.left + box.width / 2, box.top + box.height / 2];
	};
	const [x, y] = center(from);
	let best: TerminalSession | null = null;
	let bestScore = Infinity;
	for (const candidate of candidates) {
		if (candidate === from) continue;
		const [cx, cy] = center(candidate);
		const along = (cx - x) * dx + (cy - y) * dy;
		if (along <= 0) continue;
		const across = Math.abs((cx - x) * dy) + Math.abs((cy - y) * dx);
		const score = along + across * 2;
		if (score < bestScore) {
			bestScore = score;
			best = candidate;
		}
	}
	return best;
}

export const isDirectionKey = (key: string) => key in DIRECTIONS;
