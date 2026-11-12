import { confinedPath } from '../../api/v1/core/confined.js';
import type { Manifest, Permission } from '../../api/v1/types.js';
import { dataFolder } from '../../runtime/installed/folders.js';
import { spawnSandboxed } from './launch.js';

const IN_SHELL_ONLY: readonly Permission[] = ['wallpaper', 'screen-effects', 'audio-levels', 'typing', 'file-actions'];

export function unsupportedInSandbox(manifest: Manifest): string | null {
  const missing = [
    ...(manifest.permissions ?? []).filter(permission => IN_SHELL_ONLY.includes(permission)),
    ...manifest.network?.listen?.length ? ['network listen'] : [],
  ];
  if (!missing.length) return null;
  return `${new Intl.ListFormat('en', { type: 'conjunction' }).format(missing)} only ${missing.length === 1 ? 'works' : 'work'} for extensions from schelf.store, which run inside the desktop. One from your own folder runs in a sandbox without them`;
}

export function runSandboxedTurnedOffHelper(path: string, manifest: Manifest): void {
  if (manifest.helper?.turnedOff) spawnSandboxed({ path, dataPath: dataFolder(manifest.id) }, [confinedPath([path], manifest.helper.path), ...manifest.helper.turnedOff]);
}
