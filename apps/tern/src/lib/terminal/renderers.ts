import type { Terminal } from '@xterm/xterm';
import { WebglAddon } from '@xterm/addon-webgl';

const MAX_CONTEXTS = 8;

interface Renderer {
	terminal: Terminal;
	addon: WebglAddon;
}

const active: Renderer[] = [];

function release(renderer: Renderer) {
	active.splice(active.indexOf(renderer), 1);
	renderer.addon.dispose();
}

export function acquireRenderer(terminal: Terminal) {
	const existing = active.find((renderer) => renderer.terminal === terminal);
	if (existing) {
		active.splice(active.indexOf(existing), 1);
		active.push(existing);
		return;
	}
	if (active.length >= MAX_CONTEXTS) release(active[0]);
	const renderer = { terminal, addon: new WebglAddon() };
	renderer.addon.onContextLoss(() => release(renderer));
	terminal.loadAddon(renderer.addon);
	active.push(renderer);
}

export function releaseRenderer(terminal: Terminal) {
	const renderer = active.find((candidate) => candidate.terminal === terminal);
	if (renderer) release(renderer);
}
