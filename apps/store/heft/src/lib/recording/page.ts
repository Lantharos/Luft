import { t } from '@luft/i18n';
import { formatClock } from '@luft/ui';
import { session } from '#lib/app/session.svelte.js';
import { newId } from '#lib/ink/stroke.js';
import { pageSize, paperOf } from '#lib/library/model.js';
import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
import type { PageObject } from '#lib/page/objects.js';
import type { Transcript } from './transcript';

const MARGIN = 56;

const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');

function list(title: string, items: { text: string; at: number }[]) {
	if (!items.length) return '';
	const lines = items.map((item) => `<li>${escape(item.text)} (${formatClock(item.at / 1000)})</li>`).join('');
	return `<h3>${escape(title)}</h3><ul>${lines}</ul>`;
}

/** The notes of a class typed out on a new page after `index`, where they can be edited like any text. */
export async function notesPage(notebook: OpenNotebook, transcript: Transcript, index: number) {
	const { parts, heading } = transcript.notes;
	const all = <T>(pick: (part: Transcript['notes']['parts'][number]) => T[]) => parts.flatMap(pick);
	const html = [
		heading ? `<h2>${escape(heading.title)}</h2><p>${escape(heading.summary)}</p>` : '',
		list(t('notes-points'), all((part) => part.points)),
		list(
			t('notes-definitions'),
			all((part) => part.definitions).map((definition) => ({ text: `${definition.term}: ${definition.meaning}`, at: definition.at }))
		),
		list(
			t('notes-homework'),
			all((part) => part.homework).map((task) => ({ text: task.due ? `${task.task}, ${task.due}` : task.task, at: task.at }))
		),
		list(
			t('notes-questions'),
			all((part) => part.questions).map((question) => ({ text: question.answer ? `${question.question} ${question.answer}` : question.question, at: question.at }))
		)
	].join('');
	const entry = notebook.addPage(index + 1);
	const { width } = pageSize(paperOf(notebook.meta, entry), entry);
	const store = await notebook.load(entry.id);
	const box = document.createElement('div');
	box.innerHTML = html;
	const object: PageObject = { id: newId(), kind: 'text', x: MARGIN, y: MARGIN, width: width - MARGIN * 2, height: 600, html, text: box.innerText };
	store.document.commit({ removed: [], added: [], objects: [{ before: null, after: object }] });
	session.goTo = { notebook: notebook.meta.id, page: entry.id };
}
