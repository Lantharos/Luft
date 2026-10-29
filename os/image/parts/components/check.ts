import { dirname, join, normalize, resolve } from 'node:path';

import { MANIFEST } from './manifest';
import { checkoutTree, components, partNames, partReach, within, workspacePackages } from './sources';

const root = resolve(import.meta.dir, '../../../..');
const CODE = /\.(ts|js|mjs|svelte)$/;
const IMPORTS = [
  /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g,
  /new URL\(\s*['"]([^'"]+)['"],\s*import\.meta\.url/g,
  /import\.meta\.dir(?:name)?,\s*['"]([^'"]+)['"]/g,
];
const RUST_INCLUDES = /include(?:_str|_bytes)?!\(\s*"([^"]+)"/g;
const MESON_PATHS = /'(\.\.\/[^']+)'/g;

const listed = Bun.spawnSync(['git', 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root });
const tree = checkoutTree(root, listed.stdout.toString().split('\0').filter(Boolean));
const packages = workspacePackages(tree);

const inside = (path: string, dirs: string[]) => dirs.some((dir) => within(path, dir));

function existing(path: string) {
  const candidates = [path, path.replace(/\.js$/, '.ts'), `${path}.ts`, `${path}.js`, `${path}/index.ts`, `${path}/index.js`];
  return candidates.find((candidate) => tree.has(candidate));
}

const found = (file: string, pattern: RegExp) => [...tree.read(file).matchAll(pattern)].map((match) => match[1]);

function specifiers(file: string, reached: ReturnType<typeof partReach>) {
  if (file.endsWith('.rs')) return inside(file, reached.crates) ? found(file, RUST_INCLUDES) : [];
  if (!inside(file, reached.packages)) return [];
  if (file.endsWith('meson.build')) return found(file, MESON_PATHS);
  return CODE.test(file) ? IMPORTS.flatMap((pattern) => found(file, pattern)) : [];
}

function target(file: string, specifier: string) {
  if (specifier.startsWith('.')) return existing(normalize(join(dirname(file), specifier)));
  const name = specifier.split('/').slice(0, specifier.startsWith('@') ? 2 : 1).join('/');
  return packages.get(name);
}

function outsideReads(part: string) {
  const reached = partReach(tree, part);
  return tree.files
    .filter((file) => inside(file, reached.sources))
    .flatMap((file) =>
      specifiers(file, reached).flatMap((specifier) => {
        const read = target(file, specifier);
        return read && !inside(read, reached.sources) ? [`${part}: ${file} reads ${read}, which no ${MANIFEST} of the part lists`] : [];
      }),
    );
}

function missingFiles() {
  return components(tree).flatMap((component) =>
    component.files.flatMap((entry) => {
      const matches = [...new Bun.Glob(entry.from).scanSync({ cwd: join(root, component.dir) })];
      return matches.length > 0 ? [] : [`${component.dir}/${MANIFEST} installs ${entry.from}, which doesn't exist`];
    }),
  );
}

const problems = [...missingFiles(), ...partNames(tree).flatMap(outsideReads)];

if (problems.length > 0) {
  problems.forEach((problem) => console.error(problem));
  console.error(`
Each part of the image is built from only the sources its components' ${MANIFEST} files name, with the
crates and workspace packages they depend on. Add what the build reads to \`sources\` in the component's ${MANIFEST}.
See docs/image-components.md.`);
  process.exit(1);
}
console.log(`The ${partNames(tree).length} parts read only the sources their components list`);
