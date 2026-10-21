import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { type Args, bcp47, Catalog, negotiate, SOURCE_LOCALE, sourceLocaleOf } from '../../../../../packages/i18n/src/core.js';

export { FluentNumber } from '../../../../../packages/i18n/src/core.js';
export type { Args };

const RESOURCES = '/com/lantharos/kestrel/locales';
const decoder = new TextDecoder();
const listeners = new Set<() => void>();
let chosen = '';
let chosenFormats = '';
let catalog: Catalog | null = null;
let english: Catalog | null = null;

function requested(): string[] {
  const override = GLib.getenv('LUFT_LOCALE');
  if (override) return [override];
  const environment = [...(GLib.getenv('LANGUAGE') ?? '').split(':'), GLib.getenv('LC_ALL'), GLib.getenv('LC_MESSAGES'), GLib.getenv('LANG')];
  return [chosen, ...environment].flatMap(name => (name && bcp47(name)) || []);
}

function load(locale: string): Catalog {
  const bytes = Gio.resources_lookup_data(`${RESOURCES}/${sourceLocaleOf(locale)}.ftl`, Gio.ResourceLookupFlags.NONE);
  return new Catalog(locale, decoder.decode(bytes.toArray()));
}

const current = () => (catalog ??= load(negotiate(requested())));

export const t = (id: string, args?: Args): string => current().format(id, args);

export const locale = (): string => current().locale;

export const inEnglish = (id: string, args?: Args): string => (english ??= load(SOURCE_LOCALE)).format(id, args);

export function formatsLocale(): string {
  const override = GLib.getenv('LUFT_LOCALE');
  if (override) return override;
  const named = chosenFormats || chosen || GLib.getenv('LC_ALL') || GLib.getenv('LC_TIME') || GLib.getenv('LANG');
  return (named && bcp47(named)) || locale();
}

export function onLocaleChanged(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function chooseLocale(language: string, formats: string): void {
  const [previousLocale, previousFormats] = [current().locale, formatsLocale()];
  chosen = language;
  chosenFormats = formats;
  const next = negotiate(requested());
  if (next !== previousLocale) catalog = load(next);
  if (next === previousLocale && formatsLocale() === previousFormats) return;
  for (const listener of [...listeners]) listener();
}
