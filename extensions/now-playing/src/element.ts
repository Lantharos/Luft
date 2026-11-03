import type { ElementLayout, Extension, MediaPlayer, View } from '@luft/extension-api';

import type { Following } from './following.js';
import { clock } from './time.js';

type Granted = 'taskbar' | 'media' | 'popups';

const TEXT_WIDTH = 150;
const PROGRESS_WIDTH = 120;

export function cover(player: MediaPlayer, size: number, radius: number): View {
  return player.artwork
    ? { type: 'image', path: player.artwork, width: size, height: size, radius }
    : { type: 'icon', icon: 'audio-x-generic-symbolic', size: Math.round(size * 0.6) };
}

export function controls(extension: Extension<Granted>, player: MediaPlayer, vertical = false): View {
  const button = (icon: string, label: string, onActivate: () => void, disabled = false): View =>
    ({ type: 'button', icon, label, iconOnly: true, style: 'flat', disabled, onActivate });
  return {
    type: vertical ? 'column' : 'row',
    spacing: 0,
    children: [
      button('media-skip-backward-symbolic', extension.t('previous'), () => player.previous(), !player.canGoPrevious),
      button(player.playing ? 'media-playback-pause-symbolic' : 'media-playback-start-symbolic',
        extension.t(player.playing ? 'pause' : 'play'), () => player.playPause()),
      button('media-skip-forward-symbolic', extension.t('next'), () => player.next(), !player.canGoNext),
    ],
  };
}

function words(extension: Extension<Granted>, player: MediaPlayer): View {
  return {
    type: 'column',
    spacing: 0,
    align: 'start',
    children: [
      { type: 'text', text: player.title, style: 'title', maxWidth: TEXT_WIDTH, marquee: true },
      { type: 'text', text: player.artist || extension.t('unknown-artist'), style: 'caption', maxWidth: TEXT_WIDTH },
    ],
  };
}

function parts(extension: Extension<Granted>, player: MediaPlayer, layout: ElementLayout): { art: View[]; text: View[]; buttons: View[] } {
  const show = extension.settings.get<string>('show');
  return {
    art: show !== 'title' ? [cover(player, layout.button - 8, 6)] : [],
    text: show !== 'cover' ? [words(extension, player)] : [],
    buttons: extension.settings.get<boolean>('controls') ? [controls(extension, player, layout.vertical)] : [],
  };
}

/** What the taskbar shows: the cover, the title and artist, and the controls, as much as people chose. */
export function compact(extension: Extension<Granted>, following: Following, layout: ElementLayout): View {
  const player = following.player;
  if (!player) return { type: 'spacer' };
  const { art, text, buttons } = parts(extension, player, layout);
  if (layout.vertical) return { type: 'column', spacing: 4, align: 'center', children: [cover(player, layout.button - 8, 6), ...buttons] };
  return { type: 'row', spacing: 8, children: [...art, ...text, ...buttons] };
}

/** What it grows to under the pointer: the same, with how far the track is and which app plays it. */
export function expanded(extension: Extension<Granted>, following: Following, layout: ElementLayout): View {
  const player = following.player;
  if (!player || layout.vertical) return compact(extension, following, layout);
  const { art, text, buttons } = parts(extension, player, layout);
  const position = following.position(player);
  const progress: View = {
    type: 'column',
    spacing: 4,
    align: 'fill',
    children: [
      ...player.length ? [{ type: 'progress' as const, value: position / player.length }] : [],
      {
        type: 'text', style: 'caption', maxWidth: PROGRESS_WIDTH,
        text: player.length ? `${clock(position)} / ${clock(player.length)} · ${player.appName}` : player.appName,
      },
    ],
  };
  return { type: 'row', spacing: 10, children: [...art, ...text, progress, ...buttons] };
}
