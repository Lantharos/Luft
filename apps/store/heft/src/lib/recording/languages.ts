import { i18n } from '@luft/i18n';
import { languages } from '#lib/convert/read.js';
import type { SubjectMeta } from '#lib/library/model.js';
import type { Transcript } from './transcript';

export const CLASS_LANGUAGES = ['sq', 'de', 'hr', 'bs', 'sr', 'en', 'fr', 'it', 'es', 'ru', 'hu', 'tr', 'el', 'mk', 'bg', 'sl'] as const;

const serbian = () => (i18n.locale === 'sr-Latn' || !i18n.locale.startsWith('sr') ? 'sr-Latn' : 'sr-Cyrl');

const tagged = (code: string) => (code === 'sr' ? serbian() : code);

const ownLanguage = () => tagged(i18n.locale.split('-')[0]);

export const spokenIn = (subject?: SubjectMeta) => [...new Set((subject?.languages?.length ? subject.languages : languages()).map((tag) => tag.split('-')[0]))];

export const classLanguages = (subject?: SubjectMeta) => spokenIn(subject).map(tagged);

export function notesLanguage(transcript: Transcript, subject?: SubjectMeta): string {
	const own = ownLanguage();
	const spoken = new Map<string, number>();
	for (const said of transcript.said) spoken.set(said.language, (spoken.get(said.language) ?? 0) + said.end - said.start);
	if (spoken.has(own.split('-')[0])) return own;
	const most = [...spoken].sort((a, b) => b[1] - a[1])[0]?.[0];
	return most ? tagged(most) : (classLanguages(subject)[0] ?? own);
}
