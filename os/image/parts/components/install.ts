import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

import { type Component, findManifests, type Install, loadComponent, nestedComponent } from './manifest';

const USAGE = `Usage: os/image/parts/components/install.ts DESTDIR --part PART
       os/image/parts/components/install.ts DESTDIR COMPONENT...

Builds the programs of a part's components, or of the components in the
folders given, and installs them with the rest of their files under DESTDIR.`;

const PLACEHOLDERS: Record<string, string> = {
  '@libexecdir@': '/usr/libexec',
  '@bindir@': '/usr/bin',
  '@pamdir@': '/usr/lib64/security',
};

const root = resolve(import.meta.dir, '../../../..');
const targetDir = process.env.CARGO_TARGET_DIR ?? join(root, 'target');

function run(command: string[], stdin?: Uint8Array) {
  const result = Bun.spawnSync(command, { cwd: root, stdin: stdin ?? 'ignore', stdout: 'inherit', stderr: 'inherit' });
  if (!result.success) throw new Error(`${command.join(' ')} failed`);
}

function chosen(args: string[]) {
  if (args[0] === '--part' && args.length === 2) {
    return findManifests(root).map((dir) => loadComponent(root, dir)).filter((component) => component.part === args[1]);
  }
  return args.map((dir) => loadComponent(root, dir));
}

const readToml = (path: string) => Bun.TOML.parse(readFileSync(join(root, path), 'utf8')) as Record<string, Record<string, unknown>>;

function crates(component: Component) {
  const members = readToml('Cargo.toml').workspace.members as string[];
  return members
    .filter((member) => member.startsWith(`${component.dir}/`) || member === component.dir)
    .filter((member) => !nestedComponent(member, component.dir, (path) => existsSync(join(root, path))))
    .map((member) => String(readToml(`${member}/Cargo.toml`).package.name));
}

function build(list: Component[]) {
  const builds = Map.groupBy(
    list.filter((component) => component.programs.length > 0),
    ({ cargo }) => `${cargo.profile} ${cargo.target ?? ''}`,
  );
  for (const [key, group] of builds) {
    const [profile, target] = key.split(' ');
    const packages = group.flatMap(crates).flatMap((name) => ['-p', name]);
    run(['cargo', 'build', '--locked', '--profile', profile, ...(target ? ['--target', target] : []), ...packages]);
  }
}

function destination(destdir: string, entry: Install, source: string) {
  return join(destdir, entry.to.endsWith('/') ? `${entry.to}${basename(source)}` : entry.to);
}

function fill(contents: Buffer) {
  return Buffer.from(
    Object.entries(PLACEHOLDERS).reduce((text, [placeholder, value]) => text.replaceAll(placeholder, value), contents.toString('latin1')),
    'latin1',
  );
}

function sourcesOf(component: Component, entry: Install) {
  const dir = join(root, component.dir);
  if (!entry.from.includes('*')) return [join(dir, entry.from)];
  return [...new Bun.Glob(entry.from).scanSync({ cwd: dir })].sort().map((path) => join(dir, path));
}

function installComponent(destdir: string, component: Component) {
  const { profile, target } = component.cargo;
  for (const program of component.programs) {
    const built = join(targetDir, target ?? '', profile, program.from);
    run(['install', '-DZ', '-m', program.mode, built, destination(destdir, program, built)]);
  }
  for (const file of component.files) {
    for (const source of sourcesOf(component, file)) {
      run(['install', '-DZ', '-m', file.mode, '/dev/stdin', destination(destdir, file, source)], fill(readFileSync(source)));
    }
  }
  for (const [to, link] of Object.entries(component.links)) {
    const path = join(destdir, to);
    mkdirSync(dirname(path), { recursive: true, mode: 0o755 });
    rmSync(path, { force: true });
    symlinkSync(link, path);
  }
}

function writePresets(destdir: string, component: Component) {
  for (const scope of ['system', 'user'] as const) {
    const units = component.enable[scope];
    if (units.length === 0) continue;
    const preset = join(destdir, `/usr/lib/systemd/${scope}-preset/40-luft-${component.dir.replaceAll('/', '-')}.preset`);
    run(['install', '-DZ', '-m', '644', '/dev/stdin', preset], Buffer.from(units.map((unit) => `enable ${unit}\n`).join('')));
  }
}

const [given, ...args] = process.argv.slice(2);
if (!given || args.length === 0) {
  console.error(USAGE);
  process.exit(2);
}
const destdir = resolve(given);

const list = chosen(args);
build(list);
for (const component of list) {
  installComponent(destdir, component);
  writePresets(destdir, component);
}
