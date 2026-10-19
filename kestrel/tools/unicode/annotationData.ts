import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { KAOMOJI } from '../../ui/src/surfaces/emoji/catalog/kaomoji.ts';

const [cldr, emojiPath, charactersPath, output, depfile] = process.argv.slice(2);
const FOLDERS = ['annotations', 'annotationsDerived'];
const ANNOTATION = /<annotation cp="([^"]+)"( type="tts")?>([^<]+)<\/annotation>/g;
const INHERITED = '↑↑↑';
const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };

type Annotation = [keywords: string | null, ...names: string[]];

if (!depfile) throw new Error('A CLDR folder, emoji.json, characters.json, an output folder and a depfile are required');

function unescape(text: string): string {
  return text.includes('&') ? text.replace(/&(amp|lt|gt|quot|apos);/g, entity => ENTITIES[entity]) : text;
}

function withoutSelectors(text: string): string {
  return text.replace(/[\u{FE0E}\u{FE0F}]/gu, '');
}

async function catalogTexts(): Promise<Set<string>> {
  const groups: { emoji: (string | [string, string])[] }[] = await Bun.file(emojiPath).json();
  const emoji = groups.flatMap(group => group.emoji.map(entry => typeof entry === 'string' ? entry : entry[0]));
  const table: { tabs: { sections: { characters: string }[] }[] } = await Bun.file(charactersPath).json();
  const characters = table.tabs.flatMap(tab => tab.sections.flatMap(section => Array.from(section.characters)));
  return new Set([...emoji, ...emoji.map(withoutSelectors), ...characters, ...KAOMOJI.map(([text]) => text)]);
}

const wanted = await catalogTexts();
const sources: string[] = [];
const locales = new Map<string, Map<string, Annotation>>();

for (const folder of FOLDERS) {
  for (const file of (await readdir(join(cldr, folder))).filter(name => name.endsWith('.xml')).sort()) {
    const path = join(cldr, folder, file);
    sources.push(path);
    const locale = file.slice(0, -'.xml'.length);
    const annotations = locales.get(locale) ?? new Map<string, Annotation>();
    locales.set(locale, annotations);
    for (const [, key, tts, value] of (await Bun.file(path).text()).matchAll(ANNOTATION)) {
      if (value === INHERITED) continue;
      const text = unescape(key);
      if (!wanted.has(text)) continue;
      const annotation = annotations.get(text) ?? [null];
      annotations.set(text, annotation);
      if (tts) annotation.push(unescape(value));
      else annotation[0] = unescape(value);
    }
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(output);
for (const [locale, annotations] of locales) {
  if (annotations.size) await writeFile(join(output, `${locale}.json`), JSON.stringify(Object.fromEntries(annotations)));
}
const inputs = [...sources, emojiPath, charactersPath, join(import.meta.dir, '../../ui/src/surfaces/emoji/catalog/kaomoji.ts')];
await writeFile(depfile, `${output}: ${inputs.map(input => input.replaceAll(' ', '\\ ')).join(' ')}\n`);
