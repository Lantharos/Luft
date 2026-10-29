import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const MANIFEST = 'image.toml';

type Entry = string | { from: string; mode?: string };
type Table = Record<string, Entry | Entry[]>;

type Raw = {
  part?: string;
  sources?: string[];
  cargo?: { profile?: string; target?: string };
  programs?: Table;
  files?: Table;
  links?: Record<string, string>;
  enable?: { system?: string[]; user?: string[] };
};

export type Install = { to: string; from: string; mode: string };

export type Component = {
  dir: string;
  part: string;
  sources: string[];
  cargo: { profile: string; target?: string };
  programs: Install[];
  files: Install[];
  links: Record<string, string>;
  enable: { system: string[]; user: string[] };
};

const SKIPPED = new Set(['node_modules', 'target']);

function entries(table: Table | undefined, mode: string) {
  return Object.entries(table ?? {}).flatMap(([to, value]) =>
    [value].flat().map((entry) => {
      const { from, mode: given = mode } = typeof entry === 'string' ? { from: entry } : entry;
      return { to, from, mode: given };
    }),
  );
}

export function parseManifest(dir: string, text: string): Component {
  const raw = Bun.TOML.parse(text) as Raw;
  if (!raw.part) throw new Error(`${join(dir, MANIFEST)} names no part`);
  return {
    dir,
    part: raw.part,
    sources: raw.sources ?? [],
    cargo: { profile: raw.cargo?.profile ?? 'release', target: raw.cargo?.target },
    programs: entries(raw.programs, '755'),
    files: entries(raw.files, '644'),
    links: raw.links ?? {},
    enable: { system: raw.enable?.system ?? [], user: raw.enable?.user ?? [] },
  };
}

export function nestedComponent(crate: string, dir: string, exists: (path: string) => boolean) {
  for (let path = crate; path !== dir; path = dirname(path)) if (exists(join(path, MANIFEST))) return true;
  return false;
}

export function manifestDirs(files: Iterable<string>) {
  return [...files].filter((path) => path === MANIFEST || path.endsWith(`/${MANIFEST}`)).map((path) => dirname(path));
}

export function findManifests(root: string, dir = ''): string[] {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return entry.name.startsWith('.') || SKIPPED.has(entry.name) ? [] : findManifests(root, path);
    return entry.name === MANIFEST ? [dir] : [];
  });
}

export function loadComponent(root: string, dir: string) {
  return parseManifest(dir, readFileSync(join(root, dir, MANIFEST), 'utf8'));
}
