import { i18n } from '@luft/i18n';
import { languages } from '#lib/convert/read.js';
import type { SubjectMeta } from '#lib/library/model.js';
import type { Transcript } from './transcript';

/** Languages often taught in, for choosing a subject's. */
export const CLASS_LANGUAGES = ['sr', 'hr', 'bs', 'sq', 'de', 'en', 'fr', 'it', 'es', 'ru', 'hu', 'tr', 'el', 'mk', 'bg', 'sl'] as const;

/** Serbian in the alphabet Heft is shown in. */
const serbian = () => (i18n.locale === 'sr-Latn' || !i18n.locale.startsWith('sr') ? 'sr-Latn' : 'sr-Cyrl');

const tagged = (code: string) => (code === 'sr' ? serbian() : code);

/** Heft's own language, as transcripts and notes name it. */
const ownLanguage = () => tagged(i18n.locale.split('-')[0]);

/** A subject's languages, or the ones the person uses in class, by language code. */
export const spokenIn = (subject?: SubjectMeta) => [...new Set((subject?.languages?.length ? subject.languages : languages()).map((tag) => tag.split('-')[0]))];

/** The languages to tell apart in a subject's recordings, Serbian with its alphabet, such as sr-Latn. */
export const classLanguages = (subject?: SubjectMeta) => spokenIn(subject).map(tagged);

/**
 * Notes are written in the language the student reads Heft in when the
 * class speaks it, and otherwise in the language the class speaks most.
 */
export function notesLanguage(transcript: Transcript, subject?: SubjectMeta): string {
	const own = ownLanguage();
	const spoken = new Map<string, number>();
	for (const said of transcript.said) spoken.set(said.language, (spoken.get(said.language) ?? 0) + said.end - said.start);
	if (spoken.has(own.split('-')[0])) return own;
	const most = [...spoken].sort((a, b) => b[1] - a[1])[0]?.[0];
	return most ? tagged(most) : (classLanguages(subject)[0] ?? own);
}
