import type { PageItem, PageSection } from '@luft/extension-api';

import { SOUNDS } from './catalogue.js';
import type { Soundscapes } from './soundscapes.js';

function mixList(soundscapes: Soundscapes): PageItem[] {
  const { extension: { t }, mixes, player } = soundscapes;
  const current = soundscapes.currentMix;
  const items: PageItem[] = [{
    type: 'list',
    items: mixes.all.map(mix => ({
      title: mixes.name(mix),
      description: mix.id === current?.id ? t(player.playing ? 'current' : 'current-paused') : undefined,
      actions: [
        ...mix.id === current?.id && player.playing ? [] : [{ label: t('use'), onActivate: () => soundscapes.choose(mix) }],
        ...mix.own ? [{ label: t('delete'), danger: true, onActivate: () => mixes.delete(mix.id) }] : [],
      ],
    })),
  }];
  if (current?.own) {
    items.push({ type: 'entry', title: t('rename-mix'), value: current.name, onSubmit: name => name.trim() && mixes.rename(current.id, name.trim()) });
  } else {
    items.push({
      type: 'entry', title: t('save-mix'), description: t('save-mix.description'), value: '', placeholder: t('mix-name'),
      onSubmit: name => name.trim() && mixes.save(name.trim(), player.levels),
    });
  }
  return items;
}

/** The extension's page in Settings: playing, the mixes, a level for every sound, and how it plays. */
export function describePage(soundscapes: Soundscapes): void {
  const { extension, player } = soundscapes;
  const { t } = extension;
  extension.settingsPage.describe((): PageSection[] => [
    {
      items: [{
        type: 'switch', title: t('play'), description: soundscapes.detail() ?? soundscapes.mixName(),
        checked: player.playing, onToggled: on => (on ? player.play() : player.pause()),
      }],
    },
    { title: t('mixes'), items: mixList(soundscapes) },
    {
      title: t('sounds'),
      items: SOUNDS.map(sound => ({
        type: 'slider' as const, title: t(sound), value: player.levels[sound], min: 0, max: 1, step: 0.01, unit: 'percent' as const,
        onChanged: (level: number) => player.setLevel(sound, level),
      })),
    },
    { title: t('playback'), items: [{ setting: 'volume' }, { setting: 'sleep-timer' }, { setting: 'pause-for-media' }, { setting: 'pause-for-calls' }] },
  ]);
  soundscapes.onChanged(() => extension.settingsPage.refresh());
}
