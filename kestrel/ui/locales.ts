import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { localeFiles, merged } from '../../packages/i18n/tools/merge.js';
import { LOCALES } from '../../packages/i18n/src/locales.js';

const [output, depfile] = process.argv.slice(2);

if (!output || !depfile) {
  throw new Error('An output folder and a depfile are required');
}

const folders = [
  join(import.meta.dir, 'locales'),
  join(import.meta.dir, '../engine/locales'),
  { dir: join(import.meta.dir, '../../apps/settings/locales'), files: ['pages'] },
];
const outputs = LOCALES.map(locale => join(output, `locale-${locale}.ftl`));

await Promise.all(LOCALES.map((locale, index) => writeFile(outputs[index], merged(folders, locale))));

const folderOf = (source: (typeof folders)[number]) => (typeof source === 'string' ? source : source.dir);
const sources = folders
  .flatMap(source => [folderOf(source), ...LOCALES.flatMap(locale => [join(folderOf(source), locale), ...localeFiles(source, locale)])])
  .filter(path => existsSync(path));
await writeFile(depfile, `${outputs.join(' ')}: ${sources.join(' ')}\n`);
