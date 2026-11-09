import type { FileActionItem } from '@luft/extension-api';

import type { Peer, Pigeon } from './pigeon.js';

const LOOK_AGAIN = 'look-again';
const MENU_ICONS = 'icons/menu';
const DEVICES: Record<string, string> = { mobile: 'phone', desktop: 'computer', web: 'web', headless: 'terminal', server: 'server' };

const menuIcon = (name: string) => `${MENU_ICONS}/${name}.svg`;
const deviceIcon = (peer: Peer) => menuIcon(DEVICES[peer.kind] ?? 'computer');

/** Send to device in Rover's menu of files and folders and in the Send sheet apps open, with the devices nearby to choose from. */
export function addFileAction(pigeon: Pigeon): void {
  const { t, fileActions } = pigeon.extension;
  const devices = (): FileActionItem[] => pigeon.devices.length
    ? pigeon.devices.map(peer => ({ key: peer.id, label: peer.alias, icon: deviceIcon(peer) }))
    : [{ key: 'nobody', label: t('nobody'), disabled: true }];
  const lookAgain = (): FileActionItem => pigeon.scanning
    ? { key: 'looking', label: t('looking'), disabled: true }
    : { key: LOOK_AGAIN, label: t('look-again'), icon: menuIcon(LOOK_AGAIN), keepsMenuOpen: true };
  const action = fileActions.add({
    key: 'send',
    label: t('send-to-device'),
    icon: menuIcon('send'),
    sends: true,
    items: () => [...devices(), 'separator', lookAgain()],
    onOpened: () => pigeon.scan(),
    onActivate: (paths, choice) => {
      if (choice === LOOK_AGAIN) pigeon.scan();
      else if (choice) pigeon.send(choice, paths);
    },
  });
  let shown = '';
  pigeon.onChanged(() => {
    const now = JSON.stringify([pigeon.scanning, pigeon.devices.map(peer => [peer.id, peer.alias, peer.kind])]);
    if (now === shown) return;
    shown = now;
    action.refresh();
  });
}
