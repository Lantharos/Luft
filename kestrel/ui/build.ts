import { build } from 'esbuild';
import { join } from 'node:path';

const output = process.argv[2];

if (!output) {
  throw new Error('An output path is required');
}

await build({
  entryPoints: [join(import.meta.dir, 'src', 'kestrelUi.ts')],
  outfile: output,
  bundle: true,
  loader: { '.svg': 'text' },
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  external: ['gi://*', 'resource:///*', 'cairo', 'gettext', 'console'],
});
