import type { FileActionItem } from '@luft/extension-api';

import { deviceIcon, SEND_ICON } from './format.js';
import type { Pigeon } from './pigeon.js';

const LOOK_AGAIN = 'look-again';

/** Send to device in Rover's menu of files and folders, with the devices nearby to choose from. */
export function addFileAction(pigeon: Pigeon): void {
  const { t, fileActions } = pigeon.extension;
  const devices = (): FileActionItem[] => pigeon.devices.length
    ? pigeon.devices.map(peer => ({ key: peer.id, label: peer.alias, icon: deviceIcon(peer) }))
    : [{ key: 'nobody', label: t('nobody'), disabled: true }];
  const lookAgain = (): FileActionItem => pigeon.scanning
    ? { key: 'looking', label: t('looking'), disabled: true }
    : { key: LOOK_AGAIN, label: t('look-again'), icon: 'view-refresh-symbolic', keepsMenuOpen: true };
  const action = fileActions.add({
    key: 'send',
    label: t('send-to-device'),
    icon: SEND_ICON,
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
