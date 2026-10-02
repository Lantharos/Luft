import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SOURCE = process.argv[2] ?? 'https://unicode.org/Public/emoji/latest/emoji-test.txt';
const OUTPUT = join(import.meta.dir, '../../engine/data/emoji.json');
const GROUPS = new Map([
  ['Smileys & Emotion', 'smileys'],
  ['People & Body', 'people'],
  ['Animals & Nature', 'nature'],
  ['Food & Drink', 'food'],
  ['Activities', 'activities'],
  ['Travel & Places', 'travel'],
  ['Objects', 'objects'],
  ['Symbols', 'symbols'],
  ['Flags', 'flags'],
]);
const LIGHT = 0x1f3fb;
const TONES = [0x1f3fb, 0x1f3fc, 0x1f3fd, 0x1f3fe, 0x1f3ff];
const SELECTOR = 0xfe0f;

type Entry = string | [string, string];

const text = SOURCE.startsWith('http') ? await (await fetch(SOURCE)).text() : await Bun.file(SOURCE).text();
const groups = new Map<string, Entry[]>([...GROUPS.values()].map(id => [id, []]));
const bases = new Map<string, { group: string; index: number }>();
const qualified = new Set<string>();
const toned: number[][] = [];
let group: string | undefined;

for (const line of text.split('\n')) {
  const heading = line.match(/^# group: (.+)$/);
  if (heading) {
    group = GROUPS.get(heading[1]);
    continue;
  }
  const entry = line.match(/^([0-9A-F ]+?)\s*;\s*fully-qualified\s*#/);
  if (!entry || !group) continue;
  const codepoints = entry[1].split(' ').map(hex => parseInt(hex, 16));
  qualified.add(String.fromCodePoint(...codepoints));
  if (codepoints.some(codepoint => TONES.includes(codepoint))) {
    toned.push(codepoints);
    continue;
  }
  const list = groups.get(group)!;
  bases.set(key(codepoints), { group, index: list.length });
  list.push(String.fromCodePoint(...codepoints));
}

for (const codepoints of toned) {
  const tones = new Set(codepoints.filter(codepoint => TONES.includes(codepoint)));
  if (tones.size !== 1 || !tones.has(LIGHT)) continue;
  const base = bases.get(key(codepoints.filter(codepoint => !TONES.includes(codepoint))));
  if (!base) continue;
  const light = String.fromCodePoint(...codepoints);
  if (!TONES.every(tone => qualified.has(light.replaceAll(String.fromCodePoint(LIGHT), String.fromCodePoint(tone))))) continue;
  const list = groups.get(base.group)!;
  list[base.index] = [list[base.index] as string, light];
}

const lines = [...groups].map(([id, emoji]) => `  ${JSON.stringify({ group: id, emoji })}`);
await writeFile(OUTPUT, `[\n${lines.join(',\n')}\n]\n`);
console.log(`Wrote ${[...groups.values()].reduce((sum, list) => sum + list.length, 0)} emoji to ${OUTPUT}`);

function key(codepoints: number[]): string {
  return String.fromCodePoint(...codepoints.filter(codepoint => codepoint !== SELECTOR));
}
