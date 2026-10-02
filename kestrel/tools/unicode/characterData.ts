import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { TABS, type SectionSource } from './characterGroups.ts';

const SOURCE = process.argv[2] ?? 'https://www.unicode.org/Public/UCD/latest/ucd';
const OUTPUT = join(import.meta.dir, '../../engine/data/characters.json');
const HIDDEN = /^(C|M|Z)/;
const DEPRECATED = new Set([0x2329, 0x232A]);
const WORD_BASE = 0x80;
const GREEK_LETTER = /^GREEK (?:SMALL|CAPITAL) LETTER (\w+)$/;

interface Character {
  readonly name: string;
  readonly category: string;
}

async function read(path: string): Promise<string> {
  const location = `${SOURCE}/${path}`;
  return location.startsWith('http') ? (await fetch(location)).text() : Bun.file(location).text();
}

function records(text: string): string[][] {
  return text.split('\n').map(line => line.replace(/#.*/, '').trim()).filter(Boolean).map(line => line.split(';').map(field => field.trim()));
}

function codepoints(field: string): number[] {
  const [first, last = first] = field.split('..').map(hex => parseInt(hex, 16));
  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
}

const [unicodeData, nameAliases, emojiData, readme] = await Promise.all(
  ['UnicodeData.txt', 'NameAliases.txt', 'emoji/emoji-data.txt', 'ReadMe.txt'].map(read),
);
const version = readme.match(/version (\d+\.\d+\.\d+)/)![1];

const characters = new Map<number, Character>();
for (const [code, name, category] of records(unicodeData))
  if (!name.startsWith('<')) characters.set(parseInt(code, 16), { name, category });

const aliases = new Map<number, string[]>();
for (const [code, alias, type] of records(nameAliases)) {
  const codepoint = parseInt(code, 16);
  if (type === 'correction') characters.set(codepoint, { ...characters.get(codepoint)!, name: alias });
  else if (type === 'abbreviation' || type === 'alternate') aliases.set(codepoint, [...aliases.get(codepoint) ?? [], alias]);
}

for (const [codepoint, { name }] of characters) {
  const letter = name.match(GREEK_LETTER);
  if (letter) aliases.set(codepoint, [...aliases.get(codepoint) ?? [], letter[1]]);
}

const emojiPresentation = new Set<number>();
for (const [field, property] of records(emojiData))
  if (property === 'Emoji_Presentation') codepoints(field).forEach(codepoint => emojiPresentation.add(codepoint));

const claimed = new Set<number>();
const included = new Set<number>();

function visible(codepoint: number, source: SectionSource): boolean {
  const character = characters.get(codepoint);
  if (!character || DEPRECATED.has(codepoint) || emojiPresentation.has(codepoint)) return false;
  if (source.labels) return true;
  return !HIDDEN.test(character.category);
}

function ranged(source: SectionSource): number[] {
  const found: number[] = [];
  for (const [first, last] of source.ranges ?? []) {
    for (let codepoint = first; codepoint <= last; codepoint++) {
      const character = characters.get(codepoint);
      if (!character || claimed.has(codepoint) || !visible(codepoint, source)) continue;
      if (source.categories && !source.categories.test(character.category)) continue;
      if (source.names && !source.names.test(character.name)) continue;
      claimed.add(codepoint);
      found.push(codepoint);
    }
  }
  return found;
}

function section(source: SectionSource) {
  const curated = [...source.characters ?? Object.keys(source.labels ?? {}).join('')].map(character => character.codePointAt(0)!);
  for (const codepoint of curated)
    if (!visible(codepoint, source)) throw new Error(`U+${codepoint.toString(16).toUpperCase()} cannot be shown in ${source.title}`);
  const members = [...new Set([...curated, ...ranged(source)])];
  members.forEach(codepoint => included.add(codepoint));
  return {
    title: source.title,
    characters: String.fromCodePoint(...members),
    names: members.map(codepoint => characters.get(codepoint)!.name.toLowerCase()),
    ...source.labels && { labels: members.map(codepoint => source.labels![String.fromCodePoint(codepoint)]) },
  };
}

const tabs = TABS.map(({ sections, ...tab }) => ({ ...tab, sections: sections.map(section) }));
const frequency = new Map<string, number>();
for (const name of tabs.flatMap(tab => tab.sections.flatMap(section => section.names)))
  for (const word of name.split(' ')) frequency.set(word, (frequency.get(word) ?? 0) + 1);
const words = [...frequency.keys()].sort((a, b) => frequency.get(b)! - frequency.get(a)!);
const wordCodes = new Map(words.map((word, index) => [word, String.fromCharCode(WORD_BASE + index)]));
const encode = (name: string) => name.split(' ').map(word => wordCodes.get(word)).join('');
const encodedTabs = tabs.map(tab => ({ ...tab, sections: tab.sections.map(section => ({ ...section, names: section.names.map(encode).join('\n') })) }));
const aliasTable = Object.fromEntries([...aliases]
  .filter(([codepoint]) => included.has(codepoint))
  .map(([codepoint, names]) => [String.fromCodePoint(codepoint), names.map(name => name.toLowerCase())]));

await writeFile(OUTPUT, `${JSON.stringify({ unicode: version, words: words.join(' '), tabs: encodedTabs, aliases: aliasTable })}\n`);
console.log(`Wrote ${included.size} characters from Unicode ${version} to ${OUTPUT}`);
