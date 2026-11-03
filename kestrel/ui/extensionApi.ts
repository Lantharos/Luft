import { readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = join(import.meta.dir, '../..');
const VERSIONS = [1];

const source = (version: number) => join(import.meta.dir, 'src/extensions/api', `v${version}`, 'types.ts');
const target = (version: number) => join(root, 'packages/extension-api', `v${version}.d.ts`);

async function declarations(version: number): Promise<string> {
  const types = await readFile(source(version), 'utf8');
  return `// Written by kestrel/ui/extensionApi.ts from ${relative(root, source(version))}. Change that file, then run it again.\n\n${types}`;
}

const checking = process.argv.includes('--check');
for (const version of VERSIONS) {
  const wanted = await declarations(version);
  if (!checking) {
    await writeFile(target(version), wanted);
    continue;
  }
  const written = await readFile(target(version), 'utf8').catch(() => '');
  if (written !== wanted) throw new Error(`${relative(root, target(version))} is out of date: run bun kestrel/ui/extensionApi.ts`);
}
