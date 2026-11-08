import { t } from '@luft/i18n';
import { matchItems, PaletteState, type PaletteItem, type PaletteSource } from '@luft/ui';
import { session } from '#lib/app/session.svelte.js';
import { library } from '#lib/library/library.svelte.js';
import { searchIndex } from './index.svelte';

export const palette = new PaletteState();

export interface PaletteActions {
	newSubject(): void;
	exportPdf(): void;
	exportPng(): void;
}

function places(): PaletteItem[] {
	return library.active.flatMap((subject) => [
		{ key: `subject:${subject.meta.id}`, label: subject.meta.name, detail: t('palette-subject'), run: () => session.newPageIn(subject.meta.id) },
		...subject.notebooks.flatMap((notebook) => [
			{ key: `notebook:${notebook.meta.id}`, label: notebook.meta.name, detail: subject.meta.name, run: () => session.open(notebook) },
			...notebook.meta.sections.map((section) => ({
				key: `section:${section.id}`,
				label: section.title,
				detail: `${subject.meta.name} · ${notebook.meta.name}`,
				run: () => session.open(notebook, section.page)
			}))
		])
	]);
}

function commands(actions: PaletteActions): PaletteItem[] {
	const current = session.current;
	return [
		...(current
			? [
					{ key: 'new-page', label: t('palette-new-page'), hint: t('palette-new-page-keys'), run: () => session.newPageIn(current.meta.subject) },
					{ key: 'export-pdf', label: t('palette-export-pdf'), run: actions.exportPdf },
					{ key: 'export-png', label: t('palette-export-png'), run: actions.exportPng }
				]
			: []),
		{ key: 'new-subject', label: t('home-new-subject'), run: actions.newSubject },
		{ key: 'home', label: t('tabs-home'), run: () => session.home() }
	];
}

function hits(query: string): PaletteItem[] {
	return searchIndex.search(query).map((hit) => {
		const subject = library.subjectOf(hit.notebook);
		return {
			key: `hit:${hit.page}:${hit.kind}:${hit.at}`,
			label: hit.snippet,
			labelMatches: Array.from({ length: query.trim().length }, (_, offset) => hit.at + offset),
			detail: t('palette-hit', { subject: subject?.meta.name ?? '', notebook: hit.notebook.meta.name, page: hit.index + 1 }),
			run: () => session.open(hit.notebook, hit.page)
		};
	});
}

export function everything(actions: PaletteActions): PaletteSource {
	return {
		placeholder: t('palette-placeholder'),
		empty: t('palette-empty'),
		items: (query) => {
			const found = matchItems([...places(), ...commands(actions)], query);
			return query.trim() ? [...found.slice(0, 12), ...hits(query)] : found;
		}
	};
}
