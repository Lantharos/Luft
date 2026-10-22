import GLib from 'gi://GLib';

import { annotationKey, type Catalog, type Item } from './catalog.js';

type Annotation = [keywords: string | null, ...names: string[]];

const CHUNK = 400;

function locales(): string[] {
  const names = GLib.get_language_names().filter(name => !/[.@]/.test(name) && name !== 'C' && name !== 'POSIX');
  return [...new Set(['en', ...names.reverse()])];
}

export function annotationPaths(): string[] {
  return locales().map(locale => `${global.datadir}/emoji-annotations/${locale}.json`);
}

function apply(item: Item, [keywords, ...names]: Annotation): void {
  if (keywords !== null) item.keywords = keywords;
  if (!names.length) return;
  if (item.kind === 'emoji') item.name = names[names.length - 1];
  else item.aliases.push(...names);
}

export function* annotate(catalog: Catalog, files: readonly (Uint8Array | null)[]): Generator<void, void, unknown> {
  const emoji = new Map(catalog.items.filter(item => item.kind === 'emoji').map(item => [annotationKey(item.text), item]));
  const decoder = new TextDecoder();
  for (const file of files) {
    if (!file) continue;
    const annotations = Object.entries<Annotation>(JSON.parse(decoder.decode(file)));
    yield;
    for (let start = 0; start < annotations.length; start += CHUNK) {
      for (const [text, annotation] of annotations.slice(start, start + CHUNK)) {
        const picture = emoji.get(text);
        const character = catalog.find(text);
        if (picture) apply(picture, annotation);
        if (character && character !== picture) apply(character, annotation);
      }
      yield;
    }
  }
}
