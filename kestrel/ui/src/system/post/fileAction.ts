import GLib from 'gi://GLib';

import { type FileActionChoiceShape, type FileActionEntry, fileActions } from '../../extensions/fileActions/actions.js';
import { t } from '../../shared/i18n/index.js';
import type { Peer } from './client.js';
import type { Post } from './post.js';

const ID = 'kestrel/post';
const LOOK_AGAIN = 'look-again';
const DEVICES: Record<string, string> = { mobile: 'phone', desktop: 'computer', web: 'web', headless: 'terminal', server: 'server' };

const menuIcon = (name: string) => GLib.build_filenamev([global.datadir, `post-${name}.svg`]);
const deviceIcon = (peer: Peer) => menuIcon(DEVICES[peer.kind] ?? 'computer');
const choice = (key: string, label: string, icon: string, more: Partial<FileActionChoiceShape> = {}): FileActionChoiceShape =>
  ({ key, label, icon, disabled: false, keepsMenuOpen: false, separator: false, ...more });
const SEPARATOR: FileActionChoiceShape = { key: '', label: '', icon: '', disabled: true, keepsMenuOpen: false, separator: true };

/** Send to device in Rover's menu of files and folders, with the devices nearby to choose from. */
export function addFileAction(post: Post): () => void {
  const { client } = post;
  const listeners = new Set<() => void>();
  const devices = (): FileActionChoiceShape[] => client.devices.length
    ? client.devices.map(peer => choice(peer.id, peer.alias, deviceIcon(peer)))
    : [choice('nobody', t('post-nobody'), '', { disabled: true })];
  const lookAgain = (): FileActionChoiceShape => client.scanning
    ? choice('looking', t('post-looking'), '', { disabled: true })
    : choice(LOOK_AGAIN, t('post-look-again'), menuIcon(LOOK_AGAIN), { keepsMenuOpen: true });
  const entry: FileActionEntry = {
    id: ID,
    shape: () => ({
      label: t('post-send-to-device'), icon: menuIcon('send'), kind: 'any', types: [], extensions: [], multiple: true,
      items: [...devices(), SEPARATOR, lookAgain()],
    }),
    opened: () => client.scan(),
    activate: (paths, chosen) => {
      if (chosen === LOOK_AGAIN) client.scan();
      else if (chosen) client.send(chosen, paths);
    },
    watch: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  let shown = '';
  const stopWatching = client.onChanged(() => {
    const now = JSON.stringify([client.scanning, client.devices.map(peer => [peer.id, peer.alias, peer.kind])]);
    if (now === shown) return;
    shown = now;
    for (const listener of [...listeners]) listener();
  });
  const remove = fileActions.add(entry);
  return () => {
    stopWatching();
    remove();
  };
}
