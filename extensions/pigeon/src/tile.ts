import type { MenuItem } from '@luft/extension-api';

import { ICON } from './format.js';
import type { Panel } from './panel.js';
import type { Pigeon } from './pigeon.js';
import { status } from './status.js';

/** A tile that turns receiving on and off, with the devices nearby behind its arrow. */
export function addTile(pigeon: Pigeon, panel: Panel): void {
  const { t, quickSettings, settings } = pigeon.extension;
  const menu = (): MenuItem[] => [
    ...pigeon.devices.map((peer): MenuItem => ({ label: t('send-to', { device: peer.alias }), onActivate: () => panel.show('pointer', { device: peer.id }) })),
    ...pigeon.devices.length ? ['separator' as const] : [],
    { label: t('open-pigeon'), onActivate: () => panel.show('pointer') },
    'settings',
  ];
  let shown = '';
  const toggle = quickSettings.addToggle({ title: t('pigeon'), icon: ICON, setting: 'receive', subtitle: status(pigeon), menu: menu() });
  const sync = () => {
    const now = JSON.stringify([status(pigeon), pigeon.devices.map(peer => [peer.id, peer.alias])]);
    if (now === shown) return;
    shown = now;
    toggle.update({ subtitle: status(pigeon), menu: menu() });
  };
  pigeon.onChanged(sync);
  settings.onChanged(sync);
}
