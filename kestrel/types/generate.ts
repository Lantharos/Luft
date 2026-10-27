import { $ } from 'bun';
import { copyFile, mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { MUTTER_NAMESPACES, TYPELIB_VERSIONS, mutterApiVersion } from '../ui/typelibs.js';
import { applyGjsOverrides } from './gjsOverrides.js';

const VERSIONED_ONLY_MODULES = ['Gdk-3.0', 'Gtk-3.0'];
const root = resolve(import.meta.dir, '../..');
const types = join(import.meta.dir, 'gir');

const { values: options } = parseArgs({
  options: {
    check: { type: 'boolean', default: false },
    build: { type: 'string' },
    compositor: { type: 'string' },
  },
});

const mutterVersion = mutterApiVersion();
const build = resolve(options.build ?? join(root, 'kestrel/build'));
const compositor = resolve(options.compositor ?? join(root, 'kestrel/run/mutter-install'));

if (!options.build && !options.compositor) {
  await $`${join(root, 'kestrel/compositor/build.sh')}`;
  await $`meson compile -C ${build}`;
}

const modules = [
  ...MUTTER_NAMESPACES.map(namespace => `${namespace}-${mutterVersion}`),
  ...Object.entries(TYPELIB_VERSIONS).map(([namespace, version]) => `${namespace}-${version}`),
];
const dataDirs = (process.env.XDG_DATA_DIRS || '/usr/local/share:/usr/share').split(':').filter(Boolean);
const girDirectories = [
  join(build, 'src'),
  join(build, 'src/st'),
  join(compositor, 'lib', `mutter-${mutterVersion}`),
  ...dataDirs.map(dir => join(dir, 'gir-1.0')),
];

async function tsForGir(names: string[], output: string, ...flags: string[]) {
  const directories = girDirectories.flatMap(dir => ['-g', dir]);
  await $`bun x --bun ts-for-gir generate ${names} ${directories} -o ${output} --noComments --ignoreVersionConflicts ${flags}`
    .cwd(import.meta.dir)
    .quiet();
}

async function generate(output: string) {
  await rm(output, { recursive: true, force: true });
  await tsForGir(modules, output);
  const versioned = await mkdtemp(join(tmpdir(), 'kestrel-types-versioned-'));
  await tsForGir(VERSIONED_ONLY_MODULES, versioned, '--onlyVersionPrefix');
  await Promise.all(VERSIONED_ONLY_MODULES.map(module => `${module.toLowerCase()}.d.ts`)
    .map(file => copyFile(join(versioned, file), join(output, file))));
  await rm(versioned, { recursive: true, force: true });
  await applyGjsOverrides(output);
}

async function contents(dir: string) {
  const names = (await readdir(dir)).sort();
  return new Map(await Promise.all(names.map(async name => [name, await readFile(join(dir, name), 'utf8')] as const)));
}

async function stale(fresh: string) {
  const [expected, current] = await Promise.all([contents(fresh), contents(types).catch(() => new Map<string, string>())]);
  const names = new Set([...expected.keys(), ...current.keys()]);
  return [...names].filter(name => expected.get(name) !== current.get(name));
}

if (options.check) {
  const scratch = await mkdtemp(join(tmpdir(), 'kestrel-types-'));
  await generate(scratch);
  const differing = await stale(scratch);
  await rm(scratch, { recursive: true, force: true });
  if (differing.length) {
    console.error(`Kestrel's GIR types are out of date in ${differing.join(', ')}. Run bun run generate in kestrel/types.`);
    process.exit(1);
  }
} else {
  await generate(types);
}
