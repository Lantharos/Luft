import { confinedPath } from '../../api/v1/core/confined.js';
import type { Manifest } from '../../api/v1/types.js';
import { SANDBOX_LEAVES_OUT } from '../leavesOut.js';
import { dataFolder } from '../../runtime/installed/folders.js';
import { spawnSandboxed } from './launch.js';

const asksFor = (manifest: Manifest) => [...manifest.permissions ?? [], ...manifest.network?.listen?.length ? ['listen' as const] : []];

export function unsupportedInSandbox(manifest: Manifest): string | null {
  const missing = asksFor(manifest).filter(part => (SANDBOX_LEAVES_OUT as readonly string[]).includes(part)).map(part => part === 'listen' ? 'network listen' : part);
  if (!missing.length) return null;
  return `${new Intl.ListFormat('en', { type: 'conjunction' }).format(missing)} only ${missing.length === 1 ? 'works' : 'work'} inside the desktop, for extensions schelf.store approved to run there`;
}

export function runSandboxedTurnedOffHelper(path: string, manifest: Manifest): void {
  if (manifest.helper?.turnedOff) spawnSandboxed({ path, dataPath: dataFolder(manifest.id) }, [confinedPath([path], manifest.helper.path), ...manifest.helper.turnedOff]);
}
