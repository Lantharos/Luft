import type { Extension, InputSound, InputSoundFiles, Stored } from '@luft/extension-api';

import { Library } from './packs/library.js';
import type { Pack } from './packs/pack.js';
import { PackProblem } from './packs/read.js';

type Granted = 'sounds' | 'input-sounds';

const IN_USE = 'pack';
const FIRST_PACK = 'mechanical';
const MOUSE_CLICKS = [1, 2, 3, 4, 5].map(take => `sounds/click-${take}.flac`);
const SAMPLE: readonly InputSound[] = ['key', 'key', 'key', 'space', 'key', 'key', 'backspace', 'key', 'enter', 'click'];
const SAMPLE_STEP_MS = 140;

/** What people hear: which pack plays, how loud, and a taste of it when they ask. */
export class Keystrokes {
  readonly library: Library;
  current: Pack;
  private readonly listeners: (() => void)[] = [];

  constructor(readonly extension: Extension<Granted>) {
    this.library = new Library(extension);
    const remembered = extension.storage.get<string & Stored>(IN_USE);
    this.current = this.library.packs.find(pack => pack.id === remembered) ?? this.first;
  }

  private get first(): Pack {
    return this.library.packs.find(pack => pack.id === FIRST_PACK)!;
  }

  async start(): Promise<void> {
    this.syncLevels();
    this.extension.settings.onChanged(() => this.syncLevels());
    const problem = await this.extension.inputSounds.load(this.filesOf(this.current));
    if (problem && this.current !== this.first) await this.use(this.first);
  }

  private syncLevels(): void {
    const { inputSounds, settings } = this.extension;
    inputSounds.keys = settings.get<boolean>('keys') ? settings.get<number>('key-volume') : 0;
    inputSounds.clicks = settings.get<boolean>('clicks') ? settings.get<number>('click-volume') : 0;
  }

  private filesOf(pack: Pack): InputSoundFiles {
    const { key, space, enter, backspace, click } = pack.sounds;
    return { key, space: space ?? key, enter: enter ?? key, backspace: backspace ?? key, click: click ?? MOUSE_CLICKS };
  }

  /** Switches to a pack and lets people hear it. Returns a file that can't be played, and keeps the pack it had. */
  async use(pack: Pack): Promise<string | null> {
    const problem = await this.extension.inputSounds.load(this.filesOf(pack));
    if (problem) return problem;
    this.current = pack;
    this.extension.storage.set(IN_USE, pack.id);
    this.changed();
    this.sample();
    return null;
  }

  /** Plays a few words' worth of the pack in use. */
  sample(): void {
    const { inputSounds, settings, timers } = this.extension;
    SAMPLE.forEach((sound, index) => timers.timeout(index * SAMPLE_STEP_MS, () => inputSounds.preview(sound, settings.get<number>(sound === 'click' ? 'click-volume' : 'key-volume'))));
  }

  /** Adds a folder someone picked, or removes it again and throws what's wrong with it. */
  async add(folder: string): Promise<void> {
    const pack = this.library.read(folder);
    const problem = await this.use(pack);
    if (problem) {
      this.extension.deleteFile(folder);
      throw new PackProblem('pack-unplayable', { file: problem });
    }
    this.library.add(pack);
    this.changed();
  }

  async remove(pack: Pack): Promise<void> {
    if (pack === this.current) await this.use(this.first);
    this.library.remove(pack);
    this.changed();
  }

  onChanged(changed: () => void): void {
    this.listeners.push(changed);
  }

  private changed(): void {
    for (const listener of this.listeners) listener();
  }
}
