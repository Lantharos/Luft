import type { Viewport } from '#lib/canvas/viewport.svelte.js';
import type { ToolbarActions } from '#lib/tools/Toolbar.svelte';
import { tools } from '#lib/tools/tools.svelte.js';

const typing = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(target.tagName));

export function handleKeys(event: KeyboardEvent, actions: ToolbarActions, viewport: Viewport) {
	if (typing(event.target) || event.altKey) return;
	const command = event.ctrlKey || event.metaKey;
	const key = event.key.toLowerCase();
	const run = (action: () => void) => {
		event.preventDefault();
		action();
	};
	if (command) {
		if (key === 'z' && event.shiftKey) return run(actions.redo);
		if (key === 'z' || key === 'y') return run(key === 'z' ? actions.undo : actions.redo);
		if (key === '0') return run(actions.fitWidth);
		if (key === '9') return run(actions.fitPage);
		if (key === '1') return run(actions.actualSize);
		if (key === '=' || key === '+') return run(() => actions.zoomBy(1.25));
		if (key === '-') return run(() => actions.zoomBy(0.8));
		if (key === 'enter') return run(actions.addPage);
		return;
	}
	if (/^[1-9]$/.test(key) && tools.presets[Number(key) - 1]) return run(() => tools.choose(tools.presets[Number(key) - 1].id));
	if (key === 'e') return run(() => (tools.active = 'eraser'));
	if (key === 'pagedown' || key === ' ') return run(() => viewport.panBy(0, viewport.height * 0.85));
	if (key === 'pageup') return run(() => viewport.panBy(0, -viewport.height * 0.85));
	if (key === 'arrowdown') return run(() => viewport.panBy(0, 60));
	if (key === 'arrowup') return run(() => viewport.panBy(0, -60));
	if (key === 'home') return run(() => viewport.panBy(0, -1e9));
	if (key === 'end') return run(() => viewport.panBy(0, 1e9));
}
