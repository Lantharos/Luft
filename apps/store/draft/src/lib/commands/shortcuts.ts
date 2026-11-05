import type { App } from '#lib/app/app.svelte.js';
import { combo, tabNumber } from './keys';

export function runShortcut(app: App, event: KeyboardEvent) {
	if (event.defaultPrevented || event.isComposing) return;
	const number = tabNumber(event);
	const { documents } = app.workspace;
	if (number !== null) {
		const target = number === 9 ? documents.at(-1) : documents[number - 1];
		if (target) app.workspace.activate(target);
	} else {
		const keys = combo(event);
		const command = app.commands.find((candidate) => candidate.keys?.includes(keys) && (candidate.available?.() ?? true));
		if (!command) return;
		if (app.palette.open && command.id !== 'palette.files' && command.id !== 'palette.commands') app.palette.close();
		command.run();
	}
	event.preventDefault();
	event.stopPropagation();
}
