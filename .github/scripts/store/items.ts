import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

export type Kind = 'app' | 'extension' | 'tool';
export type Item = { name: string; folder: string; kind: Kind; id: string; index: string; manifest: string; floor: string; platforms: string; runners: string[] };

const LINUX = 'linux-x86_64 linux-aarch64';
const RUNNERS = ['ubuntu-24.04', 'ubuntu-24.04-arm'];
const PLATFORM_RUNNERS: Record<string, string> = { 'linux-x86_64': RUNNERS[0], 'linux-aarch64': RUNNERS[1] };
const PLATFORMS: Record<string, string> = { 'com.lantharos.meet': 'windows-x86_64 linux-x86_64' };

type SchelfToml = { id?: string; project?: string; kind?: Kind; tool?: string; platforms?: string[] };
type Versioned = { version?: string; app?: { version?: string }; package?: { version?: string }; helper?: object };

export const platformRunner = (platform: string) => PLATFORM_RUNNERS[platform];

const toml = <T>(path: string) => Bun.TOML.parse(readFileSync(path, 'utf8')) as T;

function versionIn(manifest: string) {
  const versioned = toml<Versioned>(manifest);
  const floor = versioned.app?.version ?? versioned.package?.version ?? versioned.version;
  if (!floor) throw new Error(`${manifest} has no version`);
  return { floor, helper: versioned.helper !== undefined };
}

function tool(folder: string, { project, tool: name, platforms }: SchelfToml): Item {
  const [publisher, slug] = project!.split('/');
  const manifest = join(folder, 'Cargo.toml');
  const { floor } = versionIn(manifest);
  return { name: name!, folder, kind: 'tool', id: `${publisher}.${slug}`, index: `tools/${publisher}/${name}`, manifest, floor, platforms: platforms!.join(' '), runners: platforms!.map(platformRunner) };
}


function item(folder: string): Item {
  const schelf = toml<SchelfToml>(join(folder, 'schelf.toml'));
  if (schelf.tool) return tool(folder, schelf);
  const id = schelf.id!;
  const kind = schelf.kind ?? 'app';
  const manifest = join(folder, kind === 'app' ? 'Sabine.toml' : 'extension.toml');
  const { floor, helper } = versionIn(manifest);
  return { name: basename(folder), folder, kind, id, index: `apps/${id}`, manifest, floor, platforms: PLATFORMS[id] ?? LINUX, runners: helper ? RUNNERS : RUNNERS.slice(0, 1) };
}

export function storeItems() {
  const listed = Bun.spawnSync(['git', 'ls-files', '*/schelf.toml']);
  if (!listed.success) throw new Error(`git ls-files failed: ${listed.stderr.toString()}`);
  return listed.stdout.toString().split('\n').filter(Boolean).map((path) => item(dirname(path)));
}

export function sabineTag() {
  const tag = /^sabine = \{ git = "https:\/\/github\.com\/Lantharos\/Sabine", tag = "([^"]+)" \}$/m.exec(readFileSync('Cargo.toml', 'utf8'))?.[1];
  if (!tag) throw new Error("Cargo.toml doesn't pin Sabine to a release");
  return tag;
}
