import type { TerminalSession } from '#lib/terminal/session.svelte.js';
import { pane, remove, sessions, split, type Direction, type LayoutNode } from './layout';

let nextKey = 0;

function basename(path: string) {
	return path.split('/').filter(Boolean).at(-1) ?? '/';
}

export class Tab {
	readonly key = `tab-${++nextKey}`;
	root = $state<LayoutNode>() as LayoutNode;
	focused = $state<TerminalSession>() as TerminalSession;
	ringing = $state(false);
	sessions = $derived(sessions(this.root));
	title = $derived(this.focused.title || (this.focused.cwd ? basename(this.focused.cwd) : 'Terminal'));

	constructor(session: TerminalSession) {
		this.root = pane(session);
		this.focused = session;
	}

	split(added: TerminalSession, direction: Direction) {
		this.root = split(this.root, this.focused, added, direction);
		this.focused = added;
	}

	remove(session: TerminalSession) {
		const next = remove(this.root, session);
		if (!next) return false;
		this.root = next;
		if (this.focused === session) this.focused = sessions(next)[0];
		return true;
	}
}
