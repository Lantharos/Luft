import { i18n } from '@luft/i18n';

/** The language tag for each of Tesseract's codes that Luft is translated into. */
const TAGS: Record<string, string> = {
	sqi: 'sq',
	deu: 'de',
	hrv: 'hr',
	eng: 'en',
	bos: 'bs',
	bul: 'bg',
	cat: 'ca',
	ces: 'cs',
	dan: 'da',
	ell: 'el',
	spa: 'es',
	est: 'et',
	fin: 'fi',
	fra: 'fr',
	gle: 'ga',
	hun: 'hu',
	isl: 'is',
	ita: 'it',
	lit: 'lt',
	lav: 'lv',
	mkd: 'mk',
	mlt: 'mt',
	nor: 'no',
	nld: 'nl',
	pol: 'pl',
	por: 'pt',
	ron: 'ro',
	rus: 'ru',
	slk: 'sk',
	slv: 'sl',
	srp: 'sr-Cyrl',
	srp_latn: 'sr-Latn',
	swe: 'sv',
	tur: 'tr',
	ukr: 'uk'
};

/** Albanian, German, Croatian and English come first, then the rest by name. */
export function byPriority(a: { value: string; label: string }, b: { value: string; label: string }): number {
	const rank = (code: string) => {
		const index = FIRST.indexOf(code);
		return index < 0 ? FIRST.length : index;
	};
	return rank(a.value) - rank(b.value) || a.label.localeCompare(b.label);
}

const FIRST = ['sqi', 'deu', 'hrv', 'eng'];

/** A language Tesseract reads, named in the interface's language. */
export function languageName(code: string): string {
	const tag = TAGS[code];
	if (!tag) return code;
	return new Intl.DisplayNames(i18n.formats, { type: 'language' }).of(tag) ?? code;
}
