import { Glob } from 'bun';
import { build } from 'esbuild';
import { join, resolve } from 'node:path';

import { mutterApiVersion, typelibVersions } from '../ui/typelibs.js';

const [output] = process.argv.slice(2);

if (!output) {
  throw new Error('An output folder is required');
}

const SOURCES = ['automation', 'checks', 'fixtures', 'frames', 'motion'];
const built = resolve(output, 'tools');
const entryPoints = SOURCES.flatMap(folder => [...new Glob(`${folder}/**/*.ts`).scanSync(import.meta.dir)])
  .filter(path => !path.endsWith('.d.ts'))
  .map(path => join(import.meta.dir, path));

await build({
  entryPoints,
  outdir: built,
  outbase: import.meta.dir,
  bundle: true,
  splitting: true,
  chunkNames: 'chunks/[name]-[hash]',
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  external: ['resource:///*', 'cairo', 'gettext', 'console', 'system', 'gi'],
  define: {
    'KESTREL_TOOLS.root': JSON.stringify(resolve(import.meta.dir, '../..')),
    'KESTREL_TOOLS.built': JSON.stringify(built),
    'KESTREL_TOOLS.extensions': JSON.stringify(resolve(output, 'extensions')),
  },
  plugins: [typelibVersions(mutterApiVersion())],
  logLevel: 'warning',
});
