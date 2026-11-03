import type { ActionItem, MenuItem } from '@luft/extension-api';

import { SLEEP_CHOICES } from './mixer.js';
import type { Soundscapes } from './soundscapes.js';

const ICON = 'icons/soundscapes-symbolic.svg';

function sleepEntry({ extension: { t, settings } }: Soundscapes): ActionItem {
  const chosen = settings.get<string>('sleep-timer');
  const next = SLEEP_CHOICES[(SLEEP_CHOICES.findIndex(choice => choice === chosen) + 1) % SLEEP_CHOICES.length]!;
  return {
    label: t('sleep-entry', { length: t(`sleep-${chosen}`) }),
    checked: chosen !== 'off',
    onActivate: () => settings.set('sleep-timer', next),
  };
}

function menu(soundscapes: Soundscapes): MenuItem[] {
  const { extension: { t }, mixes } = soundscapes;
  const current = soundscapes.currentMix;
  return [
    ...mixes.all.map((mix): MenuItem => ({ label: mixes.name(mix), checked: mix.id === current?.id, onActivate: () => soundscapes.choose(mix) })),
    'separator',
    { label: t('mixer'), onActivate: () => soundscapes.openMixer() },
    sleepEntry(soundscapes),
    'settings',
  ];
}

/** The quick settings tile: on while it plays, with the mix under its title and the mixes behind its arrow. */
export function addTile(soundscapes: Soundscapes): void {
  const { extension, player } = soundscapes;
  let shownMenu = menu(soundscapes);
  const tile = extension.quickSettings.addToggle({
    title: extension.t('soundscapes'),
    icon: ICON,
    subtitle: soundscapes.mixName(),
    checked: player.playing,
    onToggled: on => (on ? player.play() : player.pause()),
    menu: shownMenu,
  });
  const describe = (items: MenuItem[]) => JSON.stringify(items.map(item => (typeof item === 'string' ? item : 'label' in item ? [item.label, item.checked] : item)));
  soundscapes.onChanged(() => {
    const fresh = menu(soundscapes);
    const menuChanged = describe(fresh) !== describe(shownMenu);
    shownMenu = fresh;
    tile.update({ subtitle: soundscapes.mixName(), checked: player.playing, ...menuChanged ? { menu: fresh } : {} });
  });
}
