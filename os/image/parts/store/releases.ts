// Picks the schelf.store releases the image preinstalls, and puts them in a stage the way Schelf reads them
// on first sign-in: each app's listing, holding only the release that ships, next to that release's file.
//
//   releases.ts resolve                 prints ID=VERSION[=PART] for each app with an approved release, on one line
//   releases.ts stage DESTDIR ID=VERSION,...

import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type Artifact = { platform: string; kind: string; url: string; size: number; sha256: string };
type Release = { version: string; artifacts: Artifact[] };
type Listing = { id: string; kind: 'app' | 'extension'; releases: Release[] } & Record<string, unknown>;
type Preinstall = { id: string; replaces?: string };

const INDEX = 'https://dl.schelf.store/index/v1/apps';
const PLATFORMS = { app: [['linux-x86_64', 'archive']], extension: [['luft-x86_64', 'extension'], ['luft', 'extension']] };
const PREINSTALL = '/usr/share/luft/preinstall';

async function listing(id: string): Promise<Listing | undefined> {
  const response = await fetch(`${INDEX}/${id}.json`);
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`schelf.store answered ${response.status} for ${id}`);
  return response.json();
}

function artifact(listing: Listing, release: Release) {
  for (const [platform, kind] of PLATFORMS[listing.kind]) {
    const found = release.artifacts.find((artifact) => artifact.platform === platform && artifact.kind === kind);
    if (found) return found;
  }
}

const newest = (listing?: Listing) => listing && listing.releases.find((release) => artifact(listing, release));

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
    const file = found && release && artifact(found, release);
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
