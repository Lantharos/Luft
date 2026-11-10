import { locale } from './catalog.js';

const ISO_639_CODE = /^[a-z]{2,3}$/i;

export function getLanguageName(code: string): string | null {
  if (!ISO_639_CODE.test(code)) return null;
  const name = new Intl.DisplayNames(locale(), { type: 'language', fallback: 'none' }).of(code);
  if (!name) return null;

  const [first, ...rest] = name;
  return first.toLocaleUpperCase(locale()) + rest.join('');
}
