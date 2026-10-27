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
  join(import.meta.dir, '../../packages/web/settings-pages/locales'),
];
const outputs = LOCALES.map(locale => join(output, `locale-${locale}.ftl`));

await Promise.all(LOCALES.map((locale, index) => writeFile(outputs[index], merged(folders, locale))));

const sources = folders
  .flatMap(folder => [folder, ...LOCALES.flatMap(locale => [join(folder, locale), ...localeFiles(folder, locale)])])
  .filter(path => existsSync(path));
await writeFile(depfile, `${outputs.join(' ')}: ${sources.join(' ')}\n`);
