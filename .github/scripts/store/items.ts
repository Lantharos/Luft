import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

export type Kind = 'app' | 'extension' | 'tool';
export type Item = { name: string; folder: string; kind: Kind; id: string; index: string; manifest: string; floor: string; platforms: string };

/** Luft runs only on 64-bit Intel and AMD, and its apps build for that alone. schelf.store wants an extension's helper for ARM too. Tools name their own platforms. */
export const LUFT_PLATFORM = 'linux-x86_64';
const HELPER_PLATFORMS = `${LUFT_PLATFORM} linux-aarch64`;
const PLATFORM_RUNNERS: Record<string, string> = { [LUFT_PLATFORM]: 'ubuntu-26.04', 'linux-aarch64': 'ubuntu-26.04-arm' };
const PLATFORMS: Record<string, string> = { 'com.lantharos.meet': 'windows-x86_64 linux-x86_64' };

type SchelfToml = { id?: string; project?: string; kind?: Kind; tool?: string; platforms?: string[] };
type Versioned = { version?: string; app?: { version?: string }; package?: { version?: string } };

export const platformRunner = (platform: string) => PLATFORM_RUNNERS[platform];

const toml = <T>(path: string) => Bun.TOML.parse(readFileSync(path, 'utf8')) as T;
const hasHelper = (manifest: string) => toml<{ helper?: unknown }>(manifest).helper !== undefined;

function versionIn(manifest: string) {
  const versioned = toml<Versioned>(manifest);
  const floor = versioned.app?.version ?? versioned.package?.version ?? versioned.version;
  if (!floor) throw new Error(`${manifest} has no version`);
  return floor;
}

function tool(folder: string, { project, tool: name, platforms }: SchelfToml): Item {
  const [publisher, slug] = project!.split('/');
  const manifest = join(folder, 'Cargo.toml');
  const { floor } = versionIn(manifest);
  return { name: name!, folder, kind: 'tool', id: `${publisher}.${slug}`, index: `tools/${publisher}/${name}`, manifest, floor, platforms: platforms!.join(' ') };
}


function item(folder: string): Item {
  const schelf = toml<SchelfToml>(join(folder, 'schelf.toml'));
  if (schelf.tool) return tool(folder, schelf);
  const id = schelf.id!;
  const kind = schelf.kind ?? 'app';
  const manifest = join(folder, kind === 'app' ? 'Sabine.toml' : 'extension.toml');
  const platforms = PLATFORMS[id] ?? (kind === 'extension' && hasHelper(manifest) ? HELPER_PLATFORMS : LUFT_PLATFORM);
  return { name: basename(folder), folder, kind, id, index: `apps/${id}`, manifest, floor: versionIn(manifest), platforms };
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
