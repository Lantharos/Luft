import { within } from './sources';

type Dependencies = Record<string, string>;
type Workspace = { name?: string } & Partial<Record<(typeof KINDS)[number], Dependencies>>;
type Lock = { workspaces: Record<string, Workspace>; packages: Record<string, unknown[]> } & Record<string, unknown>;

const KINDS = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'] as const;
const WORKSPACE = '@workspace:';

const dependenciesOf = (declared: Workspace) => KINDS.flatMap((kind) => Object.keys(declared[kind] ?? {}));

/** The package a dependency of the package at `scope` resolves to: Bun nests a package under the ones that need
 * a version of their own, so the deepest key that exists wins. */
function resolve(packages: Lock['packages'], scope: string[], name: string) {
  for (let depth = scope.length; depth >= 0; depth--) {
    const key = [...scope.slice(0, depth), name].join('/');
    if (packages[key]) return { key, scope: [...scope.slice(0, depth), name] };
  }
  return undefined;
}

/** The part of `bun.lock` that installing the workspaces in `folders` depends on: those workspaces and every
 * package they reach, so a change to another workspace's dependencies leaves it alone. */
export function reachedLock(text: string, folders: string[]) {
  const { workspaces, packages, ...settings } = Bun.JSONC.parse(text) as Lock;
  const keptWorkspaces: Record<string, Workspace> = {};
  const keptPackages: Record<string, unknown[]> = {};
  const queue: { scope: string[]; names: string[] }[] = [];

  const addWorkspace = (dir: string) => {
    if (keptWorkspaces[dir] || !workspaces[dir]) return;
    keptWorkspaces[dir] = workspaces[dir];
    queue.push({ scope: workspaces[dir].name ? [workspaces[dir].name] : [], names: dependenciesOf(workspaces[dir]) });
  };
  for (const dir of Object.keys(workspaces)) if (dir === '' || folders.some((folder) => within(dir, folder))) addWorkspace(dir);

  while (queue.length) {
    const { scope, names } = queue.pop()!;
    for (const name of names) {
      const found = resolve(packages, scope, name);
      if (!found || keptPackages[found.key]) continue;
      const entry = packages[found.key];
      keptPackages[found.key] = entry;
      const [id] = entry as [string];
      if (id.includes(WORKSPACE)) {
        addWorkspace(id.slice(id.indexOf(WORKSPACE) + WORKSPACE.length));
        continue;
      }
      const declared = entry.find((part): part is Workspace => typeof part === 'object' && part !== null);
      if (declared) queue.push({ scope: found.scope, names: dependenciesOf(declared) });
    }
  }

  const sorted = (record: Record<string, unknown>) => Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
  return JSON.stringify({ ...settings, workspaces: sorted(keptWorkspaces), packages: sorted(keptPackages) });
}
