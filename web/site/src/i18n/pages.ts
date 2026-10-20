import { getRelativeLocaleUrl } from 'astro:i18n';
import { LANGUAGES, SOURCE_LOCALE } from './locales';
import { translator } from './translate';

export function localize(astro: { currentLocale: string | undefined }) {
	const locale = astro.currentLocale ?? SOURCE_LOCALE;
	return { locale, t: translator(locale), href: (path: string) => getRelativeLocaleUrl(locale, path) };
}

export const alternates = (page: string) => LANGUAGES.map((language) => ({ ...language, href: getRelativeLocaleUrl(language.tag, page) }));
