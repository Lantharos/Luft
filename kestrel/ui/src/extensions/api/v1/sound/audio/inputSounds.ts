import type Gio from 'gi://Gio';
import Shell from 'gi://Shell';

import * as Main from '../../../../../core/main.js';
import type { ApiContext } from '../../core/context.js';
import type { InputSound, InputSoundFiles, InputSounds } from '../../types.js';
import { extensionFile } from './files.js';
import { openMix } from './sounds.js';

const KINDS: Record<InputSound, Shell.KeySound> = {
  key: Shell.KeySound.KEY,
  space: Shell.KeySound.SPACE,
  enter: Shell.KeySound.ENTER,
  backspace: Shell.KeySound.BACKSPACE,
  click: Shell.KeySound.CLICK,
};

const unit = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

export function inputSoundsApi(context: ApiContext): InputSounds {
  const { scope, host, path, dataPath } = context;
  let sounds: Shell.KeySounds | null = null;
  let keys = 0;
  let clicks = 0;
  let finishLoading: ((problem: string | null) => void) | null = null;

  const open = (): Shell.KeySounds => {
    if (sounds) return sounds;
    const created = sounds = Shell.KeySounds.new(openMix(context));
    const syncQuiet = () => created.set_quiet(!host.desktop.active || host.desktop.locked || Main.inputMethod.hidesTyping);
    created.connect('loaded', (_sounds, problem: string | null) => {
      const finish = finishLoading;
      finishLoading = null;
      finish?.(problem);
    });
    syncQuiet();
    const hidden = Main.inputMethod.connect('hides-typing-changed', syncQuiet);
    scope.disposable(host.desktop.watch(syncQuiet));
    scope.disposable(() => {
      Main.inputMethod.disconnect(hidden);
      created.close();
      sounds = null;
    });
    return created;
  };

  return {
    load: (files: InputSoundFiles) => {
      const named = Object.entries(files).flatMap(([kind, paths]) => paths.map(file => ({ kind: KINDS[kind as InputSound], file: extensionFile([path, dataPath], file) })));
      const opened = open();
      finishLoading?.(null);
      return new Promise<string | null>(resolve => {
        finishLoading = resolve;
        opened.load(named.map(sound => sound.kind), named.map((sound): Gio.File => sound.file));
        opened.set_levels(keys, clicks);
      });
    },
    get keys() {
      return keys;
    },
    set keys(value: number) {
      keys = unit(value);
      sounds?.set_levels(keys, clicks);
    },
    get clicks() {
      return clicks;
    },
    set clicks(value: number) {
      clicks = unit(value);
      sounds?.set_levels(keys, clicks);
    },
    preview: (sound: InputSound, level = 1) => open().preview(KINDS[sound], unit(level)),
  };
}
