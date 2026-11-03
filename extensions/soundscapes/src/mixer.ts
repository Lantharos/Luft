import type { View } from '@luft/extension-api';

import { ICONS, SOUNDS, type SoundName } from './catalogue.js';
import type { Soundscapes } from './soundscapes.js';

const SLEEP_BUTTONS = [
  ['off', 'sleep-short-off'],
  ['15', 'sleep-short-15'],
  ['30', 'sleep-short-30'],
  ['60', 'sleep-short-60'],
  ['90', 'sleep-short-90'],
] as const;

export const SLEEP_CHOICES = SLEEP_BUTTONS.map(([choice]) => choice);

function header({ extension: { t }, player, mixName, status }: Soundscapes): View {
  return {
    type: 'row',
    spacing: 12,
    children: [
      {
        type: 'button', iconOnly: true, style: 'primary',
        icon: player.playing ? 'media-playback-pause-symbolic' : 'media-playback-start-symbolic',
        label: t(player.playing ? 'pause' : 'play'),
        onActivate: () => (player.playing ? player.pause() : player.play()),
      },
      {
        type: 'column', spacing: 0, align: 'start',
        children: [{ type: 'text', text: mixName(), style: 'title' }, { type: 'text', text: status(), style: 'caption' }],
      },
      { type: 'spacer' },
    ],
  };
}

function channel({ extension: { t }, player }: Soundscapes, sound: SoundName): View {
  return {
    type: 'row',
    spacing: 12,
    children: [
      { type: 'icon', icon: ICONS[sound] },
      {
        type: 'column', spacing: 2,
        children: [
          { type: 'text', text: t(sound), style: 'caption' },
          { type: 'slider', label: t(sound), value: player.levels[sound], onChanged: level => player.setLevel(sound, level) },
        ],
      },
    ],
  };
}

function sleepTimer({ extension: { t, settings } }: Soundscapes): View[] {
  const chosen = settings.get<string>('sleep-timer');
  return [
    { type: 'text', text: t('sleep-timer'), style: 'caption' },
    {
      type: 'row', spacing: 4,
      children: SLEEP_BUTTONS.map(([choice, label]): View => ({
        type: 'button', label: t(label), style: choice === chosen ? 'primary' : 'flat',
        onActivate: () => settings.set('sleep-timer', choice),
      })),
    },
  ];
}

/** The pop-up mixer: playing and pausing, a slider for every sound and the sleep timer. */
export function mixer(soundscapes: Soundscapes): View {
  return {
    type: 'column',
    spacing: 12,
    children: [
      header(soundscapes),
      { type: 'separator' },
      ...SOUNDS.map(sound => channel(soundscapes, sound)),
      { type: 'separator' },
      ...sleepTimer(soundscapes),
    ],
  };
}
