import { i18n } from '@luft/i18n';

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

export function byPriority(a: { value: string; label: string }, b: { value: string; label: string }): number {
	const rank = (code: string) => {
		const index = FIRST.indexOf(code);
		return index < 0 ? FIRST.length : index;
	};
	return rank(a.value) - rank(b.value) || a.label.localeCompare(b.label);
}

const FIRST = ['sqi', 'deu', 'hrv', 'eng'];

export function languageName(code: string): string {
	const tag = TAGS[code];
	if (!tag) return code;
	return new Intl.DisplayNames(i18n.formats, { type: 'language' }).of(tag) ?? code;
}
