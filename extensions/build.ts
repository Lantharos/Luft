import { build } from 'esbuild';

const [entry, output] = process.argv.slice(2);

if (!entry || !output) {
  throw new Error("An extension's entry file and an output path are required");
}

await build({
  entryPoints: [entry],
  outfile: output,
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  external: ['gi:*'],
  logLevel: 'warning',
});
