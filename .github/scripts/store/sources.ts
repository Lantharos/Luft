import { $ } from 'bun';

import { folderSources, listedTree, type Tree, within } from '../../../os/image/parts/components/sources';
import { prunedWorkspace } from '../../../os/image/parts/stages/workspace';

type Snapshot = { objects: Map<string, string>; tree: Tree };

const NOTES_LIMIT = 40;
const snapshots = new Map<string, Snapshot>();

function git(...args: string[]) {
  const result = Bun.spawnSync(['git', ...args]);
  if (!result.success) throw new Error(`git ${args.join(' ')} failed: ${result.stderr.toString()}`);
  return result.stdout.toString();
}

function snapshot(commit: string) {
  const cached = snapshots.get(commit);
  if (cached) return cached;
  const { objects, tree } = listedTree('.', git('ls-tree', '-r', '-t', '-z', commit));
  const read = (path: string) => git('show', `${commit}:${path}`);
  const taken = { objects, tree: { ...tree, read } };
  snapshots.set(commit, taken);
  return taken;
}

function workspaceFiles({ tree }: Snapshot, sources: string[]): Record<string, string> {
  if (!sources.includes('Cargo.toml')) return {};
  const copied = (path: string) => tree.has(path) && sources.some((source) => within(path, source));
  const member = (dir: string) => (copied(`${dir}/Cargo.toml`) ? tree.read(`${dir}/Cargo.toml`) : undefined);
  const workspace = prunedWorkspace(tree.read('Cargo.toml'), tree.read('Cargo.lock'), member);
  return { 'Cargo.toml': workspace.manifest, 'Cargo.lock': workspace.lock };
}

export function sourceKey(commit: string, folder: string) {
  const taken = snapshot(commit);
  if (!taken.tree.has(folder)) return undefined;
  const sources = folderSources(taken.tree, folder);
  const workspace = workspaceFiles(taken, sources);
  const hash = new Bun.CryptoHasher('sha256');
  for (const path of sources) hash.update(`${path} ${workspace[path] ?? taken.objects.get(path)}\n`);
  return hash.digest('hex');
}

export async function changesBetween(since: string | null, until: string, folder: string) {
  const sources = folderSources(snapshot(until).tree, folder);
  const range = since ? [`${since}..${until}`] : [until];
  const subjects = (await $`git log --no-merges --format=%s -n ${NOTES_LIMIT} ${range} -- ${sources}`.text()).trim();
  return subjects ? subjects.split('\n').map((subject) => `- ${subject}`).join('\n') : '';
}

export const head = () => git('rev-parse', 'HEAD').trim();
