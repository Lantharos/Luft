import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';

import { annotationKey, type Catalog, type Item } from './catalog.js';

type Annotation = [keywords: string | null, ...names: string[]];

function locales(): string[] {
  const names = GLib.get_language_names().filter(name => !/[.@]/.test(name) && name !== 'C' && name !== 'POSIX');
  return [...new Set(['en', ...names.reverse()])];
}

function apply(item: Item, [keywords, ...names]: Annotation): void {
  if (keywords !== null) item.keywords = keywords;
  if (!names.length) return;
  if (item.kind === 'emoji') item.name = names[names.length - 1];
  else item.aliases.push(...names);
}

function load(folder: string, locale: string): Record<string, Annotation> | null {
  try {
    return JSON.parse(new TextDecoder().decode(GLib.file_get_contents(`${folder}/${locale}.json`)[1]));
  } catch {
    return null;
  }
}

export function annotate(catalog: Catalog): void {
  const folder = `${(global as unknown as Shell.Global).datadir}/emoji-annotations`;
  const emoji = new Map(catalog.items.filter(item => item.kind === 'emoji').map(item => [annotationKey(item.text), item]));
  for (const locale of locales()) {
    const annotations = load(folder, locale);
    if (!annotations) continue;
    for (const [text, annotation] of Object.entries(annotations)) {
      const picture = emoji.get(text);
      const character = catalog.find(text);
      if (picture) apply(picture, annotation);
      if (character && character !== picture) apply(character, annotation);
    }
  }
}
