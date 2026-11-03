import Shell from 'gi://Shell';

import type { ApiContext } from '../context.js';
import type { Disposable, Sound, SoundOptions, Sounds } from '../types.js';
import { extensionFile } from './files.js';

const ICON = 'application-x-addon-symbolic';
const LOCK_FADE_MS = 600;
const VOLUME_FADE_MS = 150;

const unit = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
const milliseconds = (value: number | undefined) => Math.max(0, Math.round(value ?? 0));

export function soundsApi(context: ApiContext): Sounds {
  const { scope, host, path, dataPath, name } = context;
  const ended = new Map<number, () => void>();
  let mix: Shell.SoundMix | null = null;
  let volume = 1;

  const master = () => volume * (host.desktop.active ? 1 : 0);
  const open = (): Shell.SoundMix => {
    if (mix) return mix;
    const created = mix = Shell.SoundMix.new(name, ICON);
    created.connect('ended', (_mix, id: number) => {
      const finish = ended.get(id);
      ended.delete(id);
      finish?.();
    });
    created.set_master(master(), 0);
    scope.disposable(host.desktop.watch(() => created.set_master(master(), LOCK_FADE_MS)));
    scope.disposable(() => {
      created.close();
      mix = null;
      ended.clear();
    });
    return created;
  };

  return {
    get volume() {
      return volume;
    },
    set volume(value: number) {
      volume = unit(value);
      mix?.set_master(master(), VOLUME_FADE_MS);
    },
    play: (file: string, options: SoundOptions = {}): Sound => {
      const sounds = open();
      const id = sounds.play(extensionFile([path, dataPath], file), !!options.loop, unit(options.volume ?? 1), milliseconds(options.fadeIn));
      let playing = true;
      const listeners = new Set<() => void>();
      ended.set(id, () => {
        playing = false;
        for (const listener of [...listeners]) listener();
        listeners.clear();
      });
      return {
        get playing() {
          return playing;
        },
        setVolume: (level, fade) => sounds.set_volume(id, unit(level), milliseconds(fade)),
        stop: fade => sounds.stop(id, milliseconds(fade)),
        onEnded: (callback): Disposable => {
          const guarded = scope.guard(callback);
          listeners.add(guarded);
          return scope.disposable(() => listeners.delete(guarded));
        },
        dispose: () => sounds.stop(id, 0),
      };
    },
  };
}
