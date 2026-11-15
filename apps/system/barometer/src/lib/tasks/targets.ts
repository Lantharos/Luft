import type { Entry } from '#lib/bindings.js';
import type { Process } from '#lib/bridge/rows.js';
import type { Target } from './actions/actions.svelte';
import type { Node } from './tree/node.svelte';

export interface Found {
	target: Target;
	process?: Process;
	entry?: Entry;
	stopped: boolean;
}

export function targetOf(node: Node): Found | null {
	if (node.kind === 'process' && node.process) {
		const process = node.process;
		return { target: { title: process.name, pids: [process.pid] }, process, stopped: process.state === 'T' };
	}
	if ((node.kind === 'entry' || node.kind === 'window') && node.entry) {
		const entry = node.entry;
		return { target: { title: entry.name, app: entry.key }, entry, stopped: entry.paused };
	}
	return null;
}
