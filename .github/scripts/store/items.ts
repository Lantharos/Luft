import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type Kind = 'app' | 'extension';
export type Item = { name: string; folder: string; kind: Kind; id: string; manifest: string; floor: string; platforms: string };

const FOLDERS = ['apps', 'extensions'];
const LINUX = 'linux-x86_64 linux-aarch64';
const PLATFORMS: Record<string, string> = { 'com.lantharos.meet': 'windows-x86_64 linux-x86_64' };

type SchelfToml = { id: string; kind: Kind };
type Versioned = { version?: string; app?: { version?: string } };

const toml = <T>(path: string) => Bun.TOML.parse(readFileSync(path, 'utf8')) as T;

function item(name: string, folder: string): Item {
  const { id, kind } = toml<SchelfToml>(join(folder, 'schelf.toml'));
  const manifest = join(folder, kind === 'app' ? 'Sabine.toml' : 'extension.toml');
  const versioned = toml<Versioned>(manifest);
  const floor = versioned.app?.version ?? versioned.version;
  if (!floor) throw new Error(`${manifest} has no version`);
  return { name, folder, kind, id, manifest, floor, platforms: PLATFORMS[id] ?? LINUX };
}

export function storeItems() {
  return FOLDERS.flatMap((parent) =>
    readdirSync(parent)
      .map((name) => ({ name, folder: join(parent, name) }))
      .filter(({ folder }) => existsSync(join(folder, 'schelf.toml')))
      .map(({ name, folder }) => item(name, folder)),
  );
}

export function sabineTag() {
  const tag = /^sabine = \{ git = "https:\/\/github\.com\/Lantharos\/Sabine", tag = "([^"]+)" \}$/m.exec(readFileSync('Cargo.toml', 'utf8'))?.[1];
  if (!tag) throw new Error("Cargo.toml doesn't pin Sabine to a release");
  return tag;
}
