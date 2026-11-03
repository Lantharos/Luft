import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const FOLDERS = ['apps', 'extensions'];
const LINUX = 'linux-x86_64 linux-aarch64';
const PLATFORMS: Record<string, string> = { 'com.lantharos.meet': 'windows-x86_64 linux-x86_64' };

type SchelfToml = { id: string; kind: 'app' | 'extension' };
type Versioned = { version?: string; app?: { version?: string } };

const tag = process.argv[2] ?? '';
const [, name, version] = /^([a-z0-9-]+)\/v(\d+\.\d+\.\d+)$/.exec(tag) ?? [];
if (!name) throw new Error(`${tag} isn't a store release tag, such as draft/v1.2.0`);

const folder = FOLDERS.map((parent) => join(parent, name)).find((candidate) => existsSync(join(candidate, 'schelf.toml')));
if (!folder) throw new Error(`No app or extension called ${name} has a schelf.toml`);

const toml = <T>(path: string) => Bun.TOML.parse(readFileSync(path, 'utf8')) as T;
const store = toml<SchelfToml>(join(folder, 'schelf.toml'));
const manifest = store.kind === 'app' ? toml<Versioned>(join(folder, 'Sabine.toml')).app : toml<Versioned>(join(folder, 'extension.toml'));
if (manifest?.version !== version) throw new Error(`${tag} is for ${version}, but ${folder} is at ${manifest?.version}`);

const sabine = /^sabine = \{ git = "https:\/\/github\.com\/Lantharos\/Sabine", tag = "([^"]+)" \}$/m.exec(readFileSync('Cargo.toml', 'utf8'))?.[1];
if (!sabine) throw new Error("Cargo.toml doesn't pin Sabine to a release");

const outputs = { kind: store.kind, folder, sabine, platforms: PLATFORMS[store.id] ?? LINUX };
console.log(Object.entries(outputs).map(([key, value]) => `${key}=${value}`).join('\n'));
