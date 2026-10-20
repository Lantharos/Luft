import { LANGUAGES, SOURCE_LOCALE } from '@luft/i18n/locales';

export { LANGUAGES, negotiate, SOURCE_LOCALE } from '@luft/i18n/locales';

export const pathOf = (tag: string) => tag.toLowerCase();

export const routedLocales = LANGUAGES.map(({ tag }) => tag);

export const sitemapLocales = Object.fromEntries(LANGUAGES.map(({ tag }) => [pathOf(tag), tag]));

export const localeParams = () => LANGUAGES.map(({ tag }) => ({ params: { locale: tag === SOURCE_LOCALE ? undefined : pathOf(tag) } }));
