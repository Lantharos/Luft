import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { Message, parse, Resource, serialize } from '@fluent/syntax';

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
const settingsFolder = join(import.meta.dir, '../../apps/system/settings/locales');
const catalogueFile = join(import.meta.dir, '../../packages/web/settings-catalogue/catalogue.json');
const outputs = LOCALES.map(locale => join(output, `locale-${locale}.ftl`));

type Listed = { title?: string; options?: { label?: string; note?: string }[] };
const reviewed = new Set(
  (JSON.parse(await Bun.file(catalogueFile).text()).settings as Listed[]).flatMap(setting => [
    setting.title,
    ...(setting.options ?? []).flatMap(option => [option.label, option.note]),
  ]).filter((id): id is string => !!id),
);

function settingNames(locale: string): string {
  const messages = parse(merged([settingsFolder], locale), { withSpans: false }).body
    .filter(entry => entry instanceof Message && reviewed.has(entry.id.name));
  return serialize(new Resource(messages), {});
}

await Promise.all(LOCALES.map((locale, index) => writeFile(outputs[index], `${merged(folders, locale)}\n${settingNames(locale)}`)));

const sources = folders
  .flatMap(folder => [folder, ...LOCALES.flatMap(locale => [join(folder, locale), ...localeFiles(folder, locale)])])
  .filter(path => existsSync(path));
const settingsSources = [settingsFolder, ...LOCALES.flatMap(locale => localeFiles(settingsFolder, locale))];
await writeFile(depfile, `${outputs.join(' ')}: ${[...sources, ...settingsSources, catalogueFile].join(' ')}\n`);
