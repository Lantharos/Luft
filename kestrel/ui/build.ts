import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { typelibVersions } from './typelibs.js';

const [entry, output, configJson] = process.argv.slice(2);

if (!entry || !output || !configJson) {
  throw new Error('An entry file, an output path and the build configuration are required');
}

const config = JSON.parse(configJson) as Record<string, string>;

const result = await build({
  entryPoints: [join(import.meta.dir, 'src', entry)],
  outfile: output,
  bundle: true,
  metafile: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  nodePaths: [join(import.meta.dir, 'node_modules')],
  external: ['resource:///*', 'cairo', 'gettext', 'console', 'system', 'gi'],
  define: Object.fromEntries(Object.entries(config).map(([key, value]) => [`KESTREL_CONFIG.${key}`, JSON.stringify(value)])),
  plugins: [typelibVersions(config.LIBMUTTER_API_VERSION)],
  write: false,
});

const asciiOnly = (code: string) => code.replace(/[^\x00-\x7f]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`);
await writeFile(output, asciiOnly(result.outputFiles[0].text));

const sources = Object.keys(result.metafile.inputs).map(input => resolve(input).replaceAll(' ', '\\ '));
await writeFile(`${output}.d`, `${output}: ${sources.join(' ')}\n`);
