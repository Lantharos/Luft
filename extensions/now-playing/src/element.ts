import type { ElementLayout, Extension, MediaPlayer, View } from '@luft/extension-api';

import type { Following } from './following.js';
import { clock } from './time.js';

type Granted = 'taskbar' | 'media' | 'popups';
export type Layout = 'compact' | 'full' | 'no-controls' | 'cover';

const SPACING = 8;
const CONTROL = 26;
const SMALLEST_TEXT = 60;
const PROGRESS_WIDTH = 120;

export function cover(player: MediaPlayer, size: number, radius: number, progress?: number): View {
  return player.artwork
    ? { type: 'image', path: player.artwork, width: size, height: size, radius, progress }
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

/** What people chose to see, read once per build. */
function choices(extension: Extension<Granted>) {
  const layout = extension.settings.get<Layout>('layout');
  const second = extension.settings.get<string>('second-line');
  return {
    layout,
    second: second === 'controls' && layout !== 'compact' ? 'artist' : second,
    maxWidth: extension.settings.get<number>('max-width'),
  };
}

function secondLine(extension: Extension<Granted>, player: MediaPlayer, second: string, width: number): View {
  if (second === 'controls') return controls(extension, player);
  const text = second === 'album' ? player.album || player.artist : player.artist;
  return { type: 'text', text: text || extension.t('unknown-artist'), style: 'caption', maxWidth: width };
}

function words(extension: Extension<Granted>, player: MediaPlayer, second: string, width: number): View {
  return {
    type: 'column',
    spacing: 0,
    align: 'start',
    children: [{ type: 'text', text: player.title, style: 'title', maxWidth: width, marquee: true }, secondLine(extension, player, second, width)],
  };
}

const coverSize = (layout: ElementLayout) => layout.button - 8;

function textWidth(maxWidth: number, layout: ElementLayout, beside: boolean): number {
  return Math.max(SMALLEST_TEXT, maxWidth - coverSize(layout) - SPACING - (beside ? 3 * CONTROL + SPACING : 0));
}

function upright(extension: Extension<Granted>, following: Following, player: MediaPlayer, chosen: Layout, layout: ElementLayout): View {
  if (chosen === 'cover') return cover(player, layout.button - 4, 0, progressOf(following, player));
  return {
    type: 'column', spacing: 4, align: 'center',
    children: [cover(player, coverSize(layout), 6), ...chosen === 'no-controls' ? [] : [controls(extension, player, true)]],
  };
}

const progressOf = (following: Following, player: MediaPlayer) => player.length ? following.position(player) / player.length : 0;

/** What the taskbar shows, in the layout people chose. */
export function compact(extension: Extension<Granted>, following: Following, layout: ElementLayout): View {
  const player = following.player;
  if (!player) return { type: 'spacer' };
  const { layout: chosen, second, maxWidth } = choices(extension);
  if (layout.vertical) return upright(extension, following, player, chosen, layout);
  if (chosen === 'cover') return cover(player, layout.button - 4, 0, progressOf(following, player));
  const beside = chosen === 'full';
  return {
    type: 'row',
    spacing: SPACING,
    children: [
      cover(player, coverSize(layout), 6),
      words(extension, player, second, textWidth(maxWidth, layout, beside)),
      ...beside ? [controls(extension, player)] : [],
    ],
  };
}

/** What it grows to under the pointer: the cover and title with how far the track is and which app plays it. */
export function expanded(extension: Extension<Granted>, following: Following, layout: ElementLayout): View {
  const player = following.player;
  if (!player || layout.vertical) return compact(extension, following, layout);
  const { layout: chosen, second, maxWidth } = choices(extension);
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
  const controlled = chosen === 'compact' || chosen === 'full';
  return {
    type: 'row',
    spacing: SPACING + 2,
    children: [
      cover(player, coverSize(layout), 6),
      words(extension, player, second === 'controls' ? 'artist' : second, textWidth(maxWidth, layout, false)),
      progress,
      ...controlled ? [controls(extension, player)] : [],
    ],
  };
}
