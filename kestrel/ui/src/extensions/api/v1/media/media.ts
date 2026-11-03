import { MprisSource, type MprisPlayer } from '../../../../surfaces/notifications/tray/mpris.js';
import type { ApiContext } from '../context.js';
import type { Media, MediaPlayer } from '../types.js';
import { artwork } from './artwork.js';
import { outputApi } from './output.js';

const MICROSECONDS = 1e6;

let shared: MprisSource | null = null;

function current(source: MprisSource): MprisPlayer | null {
  const players = source.players;
  return players.find(player => player.status === 'Playing') ?? players[players.length - 1] ?? null;
}

function described(player: MprisPlayer, artworkReady: () => void): MediaPlayer {
  return {
    id: player.name,
    app: player.app?.get_id() ?? null,
    appName: player.identity,
    title: player.trackTitle,
    artist: player.trackArtists.join(', '),
    album: player.trackAlbum,
    artwork: artwork.local(player.trackCoverUrl, artworkReady),
    playing: player.status === 'Playing',
    length: player.trackLength / MICROSECONDS,
    canGoNext: player.canGoNext,
    canGoPrevious: player.canGoPrevious,
    canSeek: player.canSeek,
    position: async () => (await player.position()) / MICROSECONDS,
    seek: seconds => player.seekTo(seconds * MICROSECONDS),
    playPause: () => player.playPause(),
    next: () => player.next(),
    previous: () => player.previous(),
    raise: () => player.raise(),
  };
}

export function mediaApi(context: ApiContext): Media {
  const { scope } = context;
  const source = shared ??= new MprisSource();
  const listeners = new Set<() => void>();
  const announce = () => listeners.forEach(listener => listener());
  return {
    get player() {
      const player = current(source);
      return player && described(player, announce);
    },
    get players() {
      return source.players.map(player => described(player, announce));
    },
    output: outputApi(context),
    onChanged: changed => {
      const guarded = scope.guard(changed);
      const watched = new Map<MprisPlayer, number[]>();
      const follow = () => {
        for (const [player, ids] of watched) if (!source.players.includes(player)) {
          ids.forEach(id => player.disconnect(id));
          watched.delete(player);
        }
        for (const player of source.players) if (!watched.has(player))
          watched.set(player, [player.connect('changed', guarded), player.connect('seeked', guarded)]);
      };
      const switched = () => {
        follow();
        guarded();
      };
      const ids = [source.connect('player-added', switched), source.connect('player-removed', switched)];
      listeners.add(guarded);
      follow();
      return scope.disposable(() => {
        ids.forEach(id => source.disconnect(id));
        listeners.delete(guarded);
        for (const [player, playerIds] of watched) playerIds.forEach(id => player.disconnect(id));
      });
    },
  };
}
