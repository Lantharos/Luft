import { i18n } from '@luft/i18n';
import { settings } from '#lib/app/settings.svelte.js';
import { commands } from '#lib/bindings.js';
import { POINT_FIELDS, type Stroke } from '#lib/ink/stroke.js';
import { lettersOf } from './diacritics';
import { tidy } from './normalize';

const CYRILLIC_LOCALES = new Set(['sr', 'ru', 'uk', 'bg', 'mk', 'be']);
const CYRILLIC = /\p{Script=Cyrillic}/u;
const LATIN = /\p{Script=Latin}/u;

export const pointsOf = (stroke: Stroke) => {
	const points: [number, number][] = [];
	for (let index = 0; index < stroke.points.length; index += POINT_FIELDS) points.push([stroke.points[index], stroke.points[index + 1]]);
	return points;
};

/** The languages the person writes in, as chosen in settings or as the system and Heft know them. */
export function languages() {
	return settings.values.languages.length ? settings.values.languages : [i18n.locale, ...navigator.languages];
}

/** Whether the person writes in Cyrillic, as Heft's own language does; otherwise Cyrillic look-alikes are read as Latin. */
export const writesCyrillic = () => CYRILLIC_LOCALES.has(i18n.locale);

/**
 * Reads strokes as text straight away, ahead of background reading, and
 * tidies it for the person's languages; null when it can't be read, or
 * comes out in Cyrillic to go into Latin text.
 */
export async function readNow(strokes: Stroke[], context = ''): Promise<string | null> {
	const read = await commands.handwritingRead({ strokes: strokes.map(pointsOf), now: true });
	if (read.kind !== 'text' || !read.text) return null;
	const text = tidy(read.text, lettersOf(languages(), context), writesCyrillic());
	const intoLatin = LATIN.test(context) && !CYRILLIC.test(context);
	return intoLatin && CYRILLIC.test(text) ? null : text;
}

export interface Correction {
	kind: 'strike' | 'accent' | 'rewrite' | 'insert';
	read: string;
	corrected: string;
	strokes: [number, number][][];
}

/** Keeps a correction on this computer, when the person agreed to, for tuning reading later. */
export function keep(correction: Correction) {
	if (!settings.values.keepCorrections) return;
	void commands.keepCorrection({ line: JSON.stringify({ at: Date.now(), languages: languages(), ...correction }) });
}
