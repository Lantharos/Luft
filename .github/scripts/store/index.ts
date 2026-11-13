import { type Item, platformRunner, sabineTag, storeItems } from './items';
import { isOut, listed, promote, type Release, releases, settling, taken } from './schelf';
import { changesBetween, head, sourceKey } from './sources';
import { compareVersions, newest, nextVersion } from './versions';

type Planned = Item & { version: string; notes: string };
type Published = Pick<Planned, 'id' | 'index' | 'version'>;

const NIGHTLY = 'nightly';
const STABLE = 'stable';
const SETTLE_MINUTES = 45;

const print = (outputs: Record<string, string>) =>
  console.log(
    Object.entries(outputs)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n'),
  );

async function planItem(item: Item, commit: string): Promise<Planned | undefined> {
  const all = await releases(item.id);
  if (!all) {
    console.error(`::warning::${item.id} isn't on schelf.store yet, so it waits until it's registered there`);
    return undefined;
  }
  const history = all.filter(taken);
  const last = history[0];
  if (last?.commit && sourceKey(last.commit, item.folder) === sourceKey(commit, item.folder)) return undefined;
  return {
    ...item,
    version: nextVersion(item.floor, history.map((release) => release.version)),
    notes: last?.commit ? await changesBetween(last.commit, commit, item.folder) : '',
  };
}

async function plan() {
  const commit = head();
  const planned = (await Promise.all(storeItems().map((item) => planItem(item, commit)))).filter((item) => item !== undefined);
  const pick = (kind: Item['kind'], keys: (keyof Planned)[]) =>
    JSON.stringify(planned.filter((item) => item.kind === kind).map((item) => Object.fromEntries(keys.map((key) => [key, item[key]]))));
  for (const item of planned) console.error(`${item.id} ${item.version}`);
  print({
    sabine: sabineTag(),
    apps: pick('app', ['name', 'folder', 'platforms', 'version']),
    tools: JSON.stringify(planned.filter((item) => item.kind === 'tool').flatMap(({ name, folder, version, platforms }) => platforms.split(' ').map((platform) => ({ name, folder, version, platform, runner: platformRunner(platform) })))),
    extensions: JSON.stringify(planned.filter((item) => item.kind === 'extension').flatMap(({ name, folder, version, runners }) => runners.map((runner) => ({ name, folder, version, runner })))),
    publish: JSON.stringify(planned.map(({ name, id, index, kind, folder, version, notes }) => ({ name, id, index, kind, folder, version, notes }))),
  });
}

async function settled(item: Published, deadline: number): Promise<Release | undefined> {
  const release = (await releases(item.id))!.find((candidate) => candidate.version === item.version && candidate.channel === NIGHTLY);
  const listedNow = async () => (await listed(item.index)).some((candidate) => candidate.version === item.version);
  if (release && !settling(release) && (!isOut(release) || (await listedNow()))) return release;
  if (Date.now() > deadline) return release;
  await Bun.sleep(30_000);
  return settled(item, deadline);
}

async function settle(published: Published[]) {
  const deadline = Date.now() + SETTLE_MINUTES * 60_000;
  for (const item of published) {
    const release = await settled(item, deadline);
    if (release && isOut(release)) console.error(`${item.id} ${item.version} is out on ${NIGHTLY}`);
    else console.log(`::warning::${item.id} ${item.version} is ${release?.status ?? 'missing'}, so the image keeps its newest release that's out`);
  }
}

async function catalog() {
  const versions = await Promise.all(
    storeItems().map(async (item) => {
      const version = newest((await listed(item.index)).map((release) => release.version));
      return version && `${item.id}=${version}`;
    }),
  );
  print({ releases: versions.filter(Boolean).join(' ') });
}

async function promoteItem(item: Item, version: string) {
  const history = (await releases(item.id))!;
  const stable = history.filter((release) => release.channel === STABLE && taken(release));
  const current = newest(stable.map((release) => release.version));
  if (current && compareVersions(current, version) >= 0) return console.error(`${item.id} has ${current} on ${STABLE} already`);
  const source = history.find((release) => release.version === version && isOut(release));
  const since = stable.find((release) => release.version === current)?.commit;
  const notes = since && source?.commit ? await changesBetween(since, source.commit, item.folder) : '';
  const promoted = await promote(item.id, version, STABLE, notes);
  console.error(`${item.id} ${version} went to ${STABLE}, ${promoted.status}`);
  return promoted;
}

async function promoteAll(label: string) {
  const items = new Map(storeItems().map((item) => [item.id, item]));
  const failures: string[] = [];
  for (const [id, version] of label.split(' ').filter(Boolean).map((pair) => pair.split('='))) {
    const item = items.get(id);
    if (!item) throw new Error(`${id} isn't in the repository any more`);
    try {
      await promoteItem(item, version);
    } catch (error) {
      failures.push(`${id} ${version}: ${(error as Error).message}`);
    }
  }
  if (failures.length) throw new Error(`Some releases didn't go to ${STABLE}:\n${failures.join('\n')}`);
}

const [command, argument] = process.argv.slice(2);
if (command === 'plan') await plan();
else if (command === 'settle' && argument) await settle(JSON.parse(argument));
else if (command === 'catalog') await catalog();
else if (command === 'promote' && argument !== undefined) await promoteAll(argument);
else throw new Error('Usage: index.ts plan | settle PUBLISHED | catalog | promote RELEASES');
