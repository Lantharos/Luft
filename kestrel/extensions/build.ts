import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [entry, output] = process.argv.slice(2);

if (!entry || !output) {
  throw new Error("An extension's entry file and an output path are required");
}

const result = await build({
  entryPoints: [entry],
  outfile: output,
  bundle: true,
  metafile: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  external: ['gi:*'],
  logLevel: 'warning',
});

const sources = Object.keys(result.metafile.inputs).map(input => resolve(input).replaceAll(' ', '\\ '));
await writeFile(`${output}.d`, `${output}: ${sources.join(' ')}\n`);
