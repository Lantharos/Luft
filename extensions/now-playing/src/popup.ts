import type { Extension, MediaPlayer, View } from '@luft/extension-api';

import { controls, cover } from './element.js';
import type { Following } from './following.js';
import { clock } from './time.js';

type Granted = 'taskbar' | 'media' | 'popups';

const ART = 76;
const WIDTH = 200;

function track(extension: Extension<Granted>, player: MediaPlayer): View {
  return {
    type: 'row',
    spacing: 14,
    children: [
      cover(player, ART, 12),
      {
        type: 'column',
        spacing: 2,
        align: 'start',
        children: [
          { type: 'text', text: player.title, style: 'title', maxWidth: WIDTH, marquee: true },
          { type: 'text', text: player.artist || extension.t('unknown-artist'), maxWidth: WIDTH },
          ...player.album ? [{ type: 'text' as const, text: player.album, style: 'caption' as const, maxWidth: WIDTH }] : [],
        ],
      },
    ],
  };
}

function seeking(extension: Extension<Granted>, following: Following, player: MediaPlayer): View[] {
  if (!player.length) return [];
  const position = following.position(player);
  return [
    player.canSeek
      ? { type: 'slider', label: extension.t('position'), value: position / player.length, onChanged: value => player.seek(value * player.length) }
      : { type: 'progress', value: position / player.length },
    { type: 'row', children: [
      { type: 'text', text: clock(position), style: 'caption' },
      { type: 'spacer' },
      { type: 'text', text: clock(player.length), style: 'caption' },
    ] },
  ];
}

function sound(extension: Extension<Granted>): View[] {
  const { output } = extension.media;
  const devices = output.devices;
  return [
    { type: 'separator' },
    { type: 'row', spacing: 10, children: [
      { type: 'icon', icon: output.muted || output.volume === 0 ? 'audio-volume-muted-symbolic' : 'audio-volume-high-symbolic' },
      { type: 'slider', label: extension.t('volume'), value: output.volume, onChanged: value => (output.volume = value) },
    ] },
    ...devices.length > 1 ? [
      { type: 'text' as const, text: extension.t('output'), style: 'caption' as const },
      ...devices.map((device): View => ({
        type: 'item', title: device.name, subtitle: device.detail ?? undefined, checked: device.active, onActivate: () => output.choose(device.id),
      })),
    ] : [],
  ];
}

function switcher(extension: Extension<Granted>, following: Following, player: MediaPlayer): View[] {
  const players = following.players;
  if (players.length < 2) return [];
  return [
    { type: 'separator' },
    { type: 'text', text: extension.t('players'), style: 'caption' },
    ...players.map((other): View => ({
      type: 'item', title: other.appName, subtitle: other.playing ? `${extension.t('players-playing')} · ${other.title}` : other.title,
      checked: other.id === player.id, onActivate: () => following.choose(other.id),
    })),
  ];
}

/** The pop-up behind the element: a bigger cover, seeking, the volume and output, and the other players. */
export function nowPlaying(extension: Extension<Granted>, following: Following): View {
  const player = following.player;
  if (!player) return { type: 'text', text: extension.t('no-players'), style: 'caption' };
  return {
    type: 'column',
    spacing: 10,
    children: [
      track(extension, player),
      ...seeking(extension, following, player),
      { type: 'row', align: 'center', children: [{ type: 'spacer' }, controls(extension, player), { type: 'spacer' }] },
      ...sound(extension),
      ...switcher(extension, following, player),
    ],
  };
}
