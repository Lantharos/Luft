import { readFile } from 'node:fs/promises';
import { build, type Plugin } from 'esbuild';

const [entry, output] = process.argv.slice(2);

if (!entry || !output) {
  throw new Error("An extension's entry file and an output path are required");
}

const toml: Plugin = {
  name: 'toml',
  setup: builder => builder.onLoad({ filter: /\.toml$/ }, async ({ path }) => ({
    contents: JSON.stringify(Bun.TOML.parse(await readFile(path, 'utf8'))),
    loader: 'json',
  })),
};

await build({
  entryPoints: [entry],
  outfile: output,
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  external: ['gi:*'],
  logLevel: 'warning',
  plugins: [toml],
});
