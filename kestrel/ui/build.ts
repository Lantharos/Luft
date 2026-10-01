import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const [entry, output] = process.argv.slice(2);

if (!entry || !output) {
  throw new Error('An entry name and an output path are required');
}

const result = await build({
  entryPoints: [join(import.meta.dir, 'src', `${entry}.ts`)],
  outfile: output,
  bundle: true,
  metafile: true,
  loader: { '.svg': 'text' },
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  external: ['gi://*', 'resource:///*', 'cairo', 'gettext', 'console', 'system'],
});

const sources = Object.keys(result.metafile.inputs).map(input => resolve(input).replaceAll(' ', '\\ '));
await writeFile(`${output}.d`, `${output}: ${sources.join(' ')}\n`);
