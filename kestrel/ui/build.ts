import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const output = process.argv[2];

if (!output) {
  throw new Error('An output path is required');
}

const result = await build({
  entryPoints: [join(import.meta.dir, 'src', 'kestrelUi.ts')],
  outfile: output,
  bundle: true,
  metafile: true,
  loader: { '.svg': 'text' },
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  external: ['gi://*', 'resource:///*', 'cairo', 'gettext', 'console'],
});

const sources = Object.keys(result.metafile.inputs).map(input => resolve(input).replaceAll(' ', '\\ '));
await writeFile(`${output}.d`, `${output}: ${sources.join(' ')}\n`);
