import { session } from '#lib/app/session.svelte.js';
import type { Viewport } from '#lib/canvas/viewport.svelte.js';
import type { ToolbarActions } from '#lib/tools/Toolbar.svelte';
import { selection } from '#lib/selection/selection.svelte.js';
import { tools } from '#lib/tools/tools.svelte.js';

const inField = (target: EventTarget | null) => target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(target.tagName);
const typing = (target: EventTarget | null) => inField(target) || (target instanceof HTMLElement && target.isContentEditable);

export function handleKeys(event: KeyboardEvent, actions: ToolbarActions, viewport: Viewport) {
	const command = event.ctrlKey || event.metaKey;
	if (command && event.key === 'Enter' && !event.altKey && !inField(event.target)) {
		event.preventDefault();
		return actions.addPage();
	}
	if (typing(event.target) || event.altKey) return;
	const key = event.key.toLowerCase();
	const run = (action: () => void) => {
		event.preventDefault();
		action();
	};
	if (selection.active) {
		if (key === 'delete' || key === 'backspace') return run(() => selection.remove());
		if (key === 'escape') return run(() => selection.clear());
		if (command && key === 'c') return run(() => selection.copy());
		if (command && key === 'x') return run(() => selection.cut());
		if (command && key === 'd') return run(() => selection.duplicate());
	}
	if (command) {
		if (key === 'z' && event.shiftKey) return run(actions.redo);
		if (key === 'z' || key === 'y') return run(key === 'z' ? actions.undo : actions.redo);
		if (key === '0') return run(actions.fitWidth);
		if (key === '9') return run(actions.fitPage);
		if (key === '1') return run(actions.actualSize);
		if (key === '=' || key === '+') return run(() => actions.zoomBy(1.25));
		if (key === '-') return run(() => actions.zoomBy(0.8));
		return;
	}
	if (/^[1-9]$/.test(key) && tools.presets[Number(key) - 1]) return run(() => tools.choose(tools.presets[Number(key) - 1].id));
	if (key === 'e') return run(() => (tools.active = 'eraser'));
	if (key === 'r') return run(actions.toggleRuler);
	if (key === 'l') return run(() => (tools.active = 'lasso'));
	if (viewport.single !== null && (key === 'pagedown' || key === 'pageup')) return run(() => viewport.turn(key === 'pagedown' ? 1 : -1));
	if (key === 'pagedown' || key === ' ') return run(() => viewport.panBy(0, viewport.height * 0.85));
	if (key === 'pageup') return run(() => viewport.panBy(0, -viewport.height * 0.85));
	if (key === 'arrowdown') return run(() => viewport.panBy(0, 60));
	if (key === 'arrowup') return run(() => viewport.panBy(0, -60));
	if (key === 'home') return run(() => viewport.panBy(0, -1e9));
	if (key === 'end') return run(() => viewport.panBy(0, 1e9));
}

/** Shortcuts that work everywhere, the home screen included. */
export function handleAppKeys(event: KeyboardEvent) {
	if (typing(event.target) || event.altKey || !(event.ctrlKey || event.metaKey)) return;
	const key = event.key.toLowerCase();
	const tabs = session.tabs;
	const run = (action: () => void) => {
		event.preventDefault();
		action();
	};
	if (key === 'n' && !event.shiftKey) {
		const subject = session.current?.meta.subject;
		if (subject) return run(() => session.newPageIn(subject));
	}
	if (key === 'w' && session.current) return run(() => session.close(session.current!));
	if (key === 'tab' && tabs.length) {
		const index = session.current ? tabs.indexOf(session.current) : -1;
		const next = (index + (event.shiftKey ? -1 : 1) + tabs.length + 1) % (tabs.length + 1);
		return run(() => (next === tabs.length ? session.home() : session.show(tabs[next])));
	}
}
