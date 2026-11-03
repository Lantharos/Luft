import { MprisSource, type MprisPlayer } from '../../../surfaces/notifications/tray/mpris.js';
import type { ApiContext } from './context.js';
import type { Media, MediaPlayer } from './types.js';

let shared: MprisSource | null = null;

function current(source: MprisSource): MprisPlayer | null {
  const players = source.players;
  return players.find(player => player.status === 'Playing') ?? players[players.length - 1] ?? null;
}

function described(player: MprisPlayer): MediaPlayer {
  return {
    app: player.app?.get_id() ?? null,
    title: player.trackTitle,
    artist: player.trackArtists.join(', '),
    playing: player.status === 'Playing',
    playPause: () => player.playPause(),
    next: () => player.next(),
    previous: () => player.previous(),
  };
}

export function mediaApi({ scope }: ApiContext): Media {
  const source = shared ??= new MprisSource();
  return {
    get player() {
      const player = current(source);
      return player && described(player);
    },
    onChanged: changed => {
      const guarded = scope.guard(changed);
      let watched: MprisPlayer | null = null;
      let watchedId = 0;
      const follow = () => {
        if (watched) watched.disconnect(watchedId);
        watched = current(source);
        watchedId = watched?.connect('changed', guarded) ?? 0;
      };
      const switched = () => {
        follow();
        guarded();
      };
      const ids = [source.connect('player-added', switched), source.connect('player-removed', switched)];
      follow();
      return scope.disposable(() => {
        ids.forEach(id => source.disconnect(id));
        if (watched) watched.disconnect(watchedId);
      });
    },
  };
}
