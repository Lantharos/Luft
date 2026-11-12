import type { AudioOutput, Calls, InputSounds, LockedSounds, Media, MediaPlayer, Sound, Sounds } from '../../api/v1/types.js';
import { type HostContext, Listeners, made, watching } from './basics.js';

export function soundsApi(context: HostContext): Sounds {
  const { link, scope } = context;
  let volume = 1;
  return {
    get volume() {
      return volume;
    },
    set volume(value: number) {
      volume = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
      link.call('sounds.volume', [volume]);
    },
    play: (path, options = {}) => {
      let playing = true;
      const ended = new Listeners(scope);
      const ref = link.make('sounds.play', [path, options], state => {
        if (state.playing !== false) return;
        playing = false;
        link.forget(ref);
        ended.emit();
      });
      const sound: Sound = {
        get playing() {
          return playing;
        },
        setVolume: (level, fade) => link.method(ref, 'setVolume', [level, fade]),
        stop: fade => link.method(ref, 'stop', [fade]),
        onEnded: callback => ended.add(callback),
        dispose: () => {
          if (playing) link.end(ref);
        },
      };
      return sound;
    },
  };
}

export const lockedSoundsApi = (context: HostContext): LockedSounds => ({ keep: () => made(context, 'lockedSounds.keep') });

export function inputSoundsApi({ link }: HostContext): InputSounds {
  let keys = 0;
  let clicks = 0;
  const unit = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  return {
    load: files => link.ask('inputSounds.load', [files]),
    get keys() {
      return keys;
    },
    set keys(value: number) {
      keys = unit(value);
      link.call('inputSounds.keys', [keys]);
    },
    get clicks() {
      return clicks;
    },
    set clicks(value: number) {
      clicks = unit(value);
      link.call('inputSounds.clicks', [clicks]);
    },
    preview: (sound, level) => link.call('inputSounds.preview', [sound, level]),
  };
}

export function callsApi(context: HostContext): Calls {
  const current = () => context.link.mirror<Omit<Calls, 'onChanged'>>('calls');
  return {
    get active() { return current().active; },
    get microphone() { return current().microphone; },
    get camera() { return current().camera; },
    onChanged: watching(context, 'calls'),
  };
}

type PlainPlayer = Omit<MediaPlayer, 'position' | 'seek' | 'playPause' | 'next' | 'previous' | 'raise'>;

interface MirroredMedia {
  player: string | null;
  players: PlainPlayer[];
  output: Pick<AudioOutput, 'volume' | 'muted' | 'devices'>;
}

export function mediaApi(context: HostContext): Media {
  const { link } = context;
  const current = () => link.mirror<MirroredMedia>('media');
  const player = (plain: PlainPlayer): MediaPlayer => ({
    ...plain,
    position: () => link.ask('media.position', [plain.id]),
    seek: seconds => link.call('media.seek', [plain.id, seconds]),
    playPause: () => link.call('media.control', [plain.id, 'playPause']),
    next: () => link.call('media.control', [plain.id, 'next']),
    previous: () => link.call('media.control', [plain.id, 'previous']),
    raise: () => link.call('media.control', [plain.id, 'raise']),
  });
  const output: AudioOutput = {
    get volume() {
      return current().output.volume;
    },
    set volume(volume: number) {
      link.call('media.output.volume', [Math.min(1, Math.max(0, volume))]);
    },
    get muted() {
      return current().output.muted;
    },
    set muted(muted: boolean) {
      link.call('media.output.muted', [muted]);
    },
    get devices() {
      return current().output.devices;
    },
    choose: id => link.call('media.output.choose', [id]),
    onChanged: watching(context, 'media'),
  };
  return {
    get player() {
      const { player: id, players } = current();
      const found = players.find(candidate => candidate.id === id);
      return found ? player(found) : null;
    },
    get players() {
      return current().players.map(player);
    },
    output,
    onChanged: watching(context, 'media'),
  };
}
