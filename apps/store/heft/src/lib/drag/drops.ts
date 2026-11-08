import { library } from '#lib/library/library.svelte.js';
import { drag, type Payload, type Target } from './drag.svelte';

function openBy(id: string) {
	const entry = library.notebook(id);
	return entry ? library.openNotebook(entry) : null;
}

async function dropPage(payload: Extract<Payload, { kind: 'page' }>, target: Target, after: boolean) {
	const source = openBy(payload.notebook);
	const from = source?.indexOf(payload.page) ?? -1;
	if (!source || from < 0) return;
	if (target.kind === 'page') {
		const destination = openBy(target.notebook);
		if (!destination) return;
		const at = destination.indexOf(target.page) + (after ? 1 : 0);
		if (destination === source) source.movePage(from, at);
		else await source.sendPage(from, destination, at);
	} else if (target.kind === 'notebook' && target.id !== payload.notebook) {
		const destination = openBy(target.id);
		if (destination) await source.sendPage(from, destination);
	}
}

async function dropNotebook(id: string, target: Target) {
	const notebook = library.notebook(id);
	const subject = target.kind === 'subject' ? library.subject(target.id) : undefined;
	if (notebook && subject && library.subjectOf(notebook) !== subject) await library.placeNotebook(notebook, notebook.meta.name, subject);
}

async function dropSubject(id: string, target: Target, after: boolean) {
	if (target.kind !== 'subject' || target.id === id) return;
	const order = library.subjects.filter((subject) => subject.meta.id !== id);
	const moving = library.subject(id)!;
	const at = order.findIndex((subject) => subject.meta.id === target.id) + (after ? 1 : 0);
	order.splice(at, 0, moving);
	await library.reorderSubjects(order);
}

drag.handler = (payload, target, after) => {
	if (payload.kind === 'page') void dropPage(payload, target, after);
	else if (payload.kind === 'notebook') void dropNotebook(payload.id, target);
	else void dropSubject(payload.id, target, after);
};
