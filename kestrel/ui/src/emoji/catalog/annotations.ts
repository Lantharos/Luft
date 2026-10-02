import GLib from 'gi://GLib';

import { annotationKey, type Catalog, type Item } from './catalog.js';

const ROOT = '/usr/share/unicode/cldr/common';
const FOLDERS = ['annotations', 'annotationsDerived'];
const ANNOTATION = /<annotation cp="([^"]+)"( type="tts")?>([^<]+)<\/annotation>/g;
const INHERITED = '↑↑↑';
const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };

function unescape(text: string): string {
  return text.includes('&') ? text.replace(/&(amp|lt|gt|quot|apos);/g, entity => ENTITIES[entity]) : text;
}

function locales(): string[] {
  const names = GLib.get_language_names().filter(name => !/[.@]/.test(name) && name !== 'C' && name !== 'POSIX');
  return [...new Set(['en', ...names.reverse()])];
}

function apply(item: Item, tts: string | undefined, value: string): void {
  if (!tts) item.keywords = value;
  else if (item.kind === 'emoji') item.name = value;
  else item.aliases.push(value);
}

export function annotate(catalog: Catalog): void {
  const emoji = new Map(catalog.items.filter(item => item.kind === 'emoji').map(item => [annotationKey(item.text), item]));
  const decoder = new TextDecoder();
  for (const locale of locales()) {
    for (const folder of FOLDERS) {
      let contents: Uint8Array;
      try {
        contents = GLib.file_get_contents(`${ROOT}/${folder}/${locale}.xml`)[1];
      } catch {
        continue;
      }
      for (const [, key, tts, value] of decoder.decode(contents).matchAll(ANNOTATION)) {
        if (value === INHERITED) continue;
        const text = unescape(key);
        const picture = emoji.get(text);
        const character = catalog.find(text);
        if (picture) apply(picture, tts, unescape(value));
        if (character && character !== picture) apply(character, tts, unescape(value));
      }
    }
  }
}
