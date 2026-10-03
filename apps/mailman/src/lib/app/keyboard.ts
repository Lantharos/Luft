import { BUNDLES, PRIMARY } from '#lib/mail/views.js';
import { toasts } from '#lib/shell/toasts.svelte.js';
import type { Command } from './commands';

const KEYS: Record<string, string> = {
	c: 'compose',
	'/': 'search',
	e: 'archive',
	'#': 'trash',
	Delete: 'trash',
	b: 'later',
	s: 'star',
	U: 'unread',
	I: 'read',
	r: 'reply',
	a: 'reply-all',
	f: 'forward',
	'!': 'junk',
	V: 'inbox',
	j: 'next',
	k: 'previous',
	ArrowDown: 'next',
	ArrowUp: 'previous',
	Enter: 'open',
	o: 'open',
	Escape: 'close',
	';': 'expand',
	x: 'choose',
	R: 'sync',
	'?': 'shortcuts'
};

const GO = new Map([...PRIMARY, ...BUNDLES].filter((view) => view.key).map((view) => [view.key!, `go-${view.id}`]));
const PREFIX_TIMEOUT = 1200;

let prefixed = 0;

function typing(target: EventTarget | null) {
	return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
}

function blocked() {
	return document.querySelector('[aria-modal="true"], [role="menu"]:popover-open, .composer') !== null;
}

export interface Keyboard {
	commands: () => Command[];
	palette: () => void;
}

export function handleKeydown(event: KeyboardEvent, keyboard: Keyboard) {
	const run = (id: string) => {
		const command = keyboard.commands().find((candidate) => candidate.id === id);
		if (!command) return false;
		event.preventDefault();
		command.run();
		return true;
	};
	const control = event.ctrlKey || event.metaKey;
	if (control && event.key.toLowerCase() === 'k') {
		event.preventDefault();
		return keyboard.palette();
	}
	if (control && event.key === ',') return run('settings');
	if (control && event.key.toLowerCase() === 'n') return run('compose');
	if (control || event.altKey || typing(event.target) || blocked()) return;
	if (event.key === 'z' && toasts.current?.action) {
		event.preventDefault();
		return toasts.run();
	}
	if (Date.now() - prefixed < PREFIX_TIMEOUT) {
		prefixed = 0;
		const view = GO.get(event.key.toLowerCase());
		if (view) run(view);
		return;
	}
	if (event.key === 'g') {
		prefixed = Date.now();
		return;
	}
	const id = KEYS[event.key];
	if (id) run(id);
}
