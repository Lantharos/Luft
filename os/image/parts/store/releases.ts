import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type Artifact = { platform: string; kind: string; url: string; size: number; sha256: string };
type Release = { version: string; published: string; artifacts: Artifact[] };
type Listing = { id: string; releases: Release[] } & Record<string, unknown>;
type Preinstall = { id: string; replaces?: string };

const INDEX = 'https://dl.schelf.store/index/v1/apps';
const PLATFORM = 'linux-x86_64';
const PREINSTALL = '/usr/share/luft/preinstall';

async function listing(id: string): Promise<Listing | undefined> {
  const response = await fetch(`${INDEX}/${id}.json`);
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`schelf.store answered ${response.status} for ${id}`);
  return response.json();
}

const artifact = (release: Release) =>
  release.artifacts.find((artifact) => artifact.platform === PLATFORM && artifact.kind === 'archive');

const newest = (listing?: Listing) =>
  listing?.releases.filter((release) => artifact(release)).sort((a, b) => b.published.localeCompare(a.published))[0];

async function resolve() {
  const { preinstall } = Bun.TOML.parse(await Bun.file(join(import.meta.dir, 'apps.toml')).text()) as { preinstall: Preinstall[] };
  const chosen = await Promise.all(preinstall.map(async (app) => ({ app, release: newest(await listing(app.id)) })));
  const found = chosen.flatMap(({ app, release }) => (release ? [[app.id, release.version, app.replaces].filter(Boolean).join('=')] : []));
  console.log(found.join(' '));
}

async function stage(destdir: string, versions: string) {
  const folder = join(destdir, PREINSTALL);
  mkdirSync(folder, { recursive: true });
  for (const pinned of versions.split(',')) {
    const [id, version] = pinned.split('=');
    const found = await listing(id);
    const release = found?.releases.find((candidate) => candidate.version === version);
    const file = release && artifact(release);
    if (!found || !release || !file) throw new Error(`schelf.store has no ${id} ${version} for this image`);
    const bytes = new Uint8Array(await (await fetch(file.url)).arrayBuffer());
    if (bytes.length !== file.size || createHash('sha256').update(bytes).digest('hex') !== file.sha256) {
      throw new Error(`${file.url} isn't the file schelf.store published for ${id} ${version}`);
    }
    writeFileSync(join(folder, file.url.split('/').at(-1)!), bytes);
    writeFileSync(join(folder, `${id}.json`), JSON.stringify({ ...found, releases: [release] }));
  }
}

const [command, ...args] = process.argv.slice(2);
if (command === 'resolve') await resolve();
else if (command === 'stage' && args.length === 2) await stage(args[0], args[1]);
else throw new Error('Usage: releases.ts resolve | stage DESTDIR ID=VERSION,...');
