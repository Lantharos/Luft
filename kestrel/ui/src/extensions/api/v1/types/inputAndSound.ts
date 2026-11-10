import type { Disposable } from '../types.js';

export interface Shortcuts {
  /** Runs `activated` when people press the shortcut declared as `key`, wherever they are, unless the screen is locked. */
  onActivated(key: string, activated: () => void): Disposable;
  /** What the shortcut is set to, as people read it, such as `Super+Alt+V`, or `null` while it has none. */
  label(key: string): string | null;
}

export interface Typing {
  /**
   * Types `text` into whatever has the keyboard, as if people typed it, and returns whether it could. An extension can
   * only type within ten seconds of people using it, through its shortcut, a pop-up, taskbar item, quick settings
   * tile, notification or search result, and the taskbar shows that it typed. A panel of the extension that's open
   * closes first, so the text goes where it was going before.
   */
  type(text: string): boolean;
}

export interface Sounds {
  /**
   * Plays a sound file in the extension's folder, such as an Ogg, FLAC or WAV file. Everything an extension plays goes
   * through one stream with its name, which people can turn down in Sound settings, and goes quiet while the screen
   * is locked, unless {@link LockedSounds.keep} holds it. Files are decoded once and kept while they play, so keep
   * loops short, a minute at most.
   */
  play(path: string, options?: SoundOptions): Sound;
  /** The volume of everything the extension plays, 0 to 1, changed smoothly. */
  volume: number;
}

export interface SoundOptions {
  /** 0 to 1; 1 without it. */
  volume?: number;
  /** Plays it again from the start without a gap, until it's stopped. */
  loop?: boolean;
  /** Milliseconds to fade in over. */
  fadeIn?: number;
}

export interface Sound extends Disposable {
  /** Whether it's still playing or loading. */
  readonly playing: boolean;
  /** Changes its volume, 0 to 1, over `fade` milliseconds. */
  setVolume(volume: number, fade?: number): void;
  /** Fades it out over `fade` milliseconds, then stops it. Disposing stops it at once. */
  stop(fade?: number): void;
  /** Runs `ended` when it stops: at its end, after `stop`, when it can't be played, or when the sound server goes away. */
  onEnded(ended: () => void): Disposable;
}

/** Needs the `sounds` permission too. */
export interface LockedSounds {
  /**
   * Keeps everything the extension plays going while the screen is locked, such as sounds to fall asleep to, until
   * it's disposed. Take it only while something plays that people expect to keep hearing.
   */
  keep(): Disposable;
}

/** What a press sounds like, the only thing Kestrel tells presses apart by: a letter or any other key, Space, Enter, Backspace, or a mouse button. */
export type InputSound = 'key' | 'space' | 'enter' | 'backspace' | 'click';

/** Sound files for each kind of press, in the extension's folders. With several for one kind, each press plays one of them at random. */
export type InputSoundFiles = Partial<Record<InputSound, readonly string[]>>;

/**
 * Sounds for key presses and mouse clicks. Kestrel reads the keyboard and the mouse and plays them itself, within
 * milliseconds; the extension hands over the files and levels and never hears of a press, not which key, how many or
 * when. Nothing plays while the screen is locked or while a field that hides its text has the keyboard, such as a
 * password field, and held keys don't repeat. Each press varies slightly in pitch and level. This can't be asked for
 * together with `audio-levels`, which would hear the presses in the sound. Needs the `sounds` permission too.
 */
export interface InputSounds {
  /**
   * Decodes these files ahead and switches to them once they're all ready. Each can be up to a second long, in any
   * format {@link Sounds.play} takes.
   * @returns The name of a file that can't be played, in which case the files before keep playing, or null.
   */
  load(files: InputSoundFiles): Promise<string | null>;
  /** How loud key presses are, 0 to 1. At 0, Kestrel stops looking at keys. */
  keys: number;
  /** How loud mouse clicks are, 0 to 1. At 0, Kestrel stops looking at clicks. */
  clicks: number;
  /** Plays one of a kind's sounds as a press would, at this level or 1, so people can hear it. */
  preview(sound: InputSound, level?: number): void;
}

/**
 * Whether people are in a call: an app records from the microphone or films with the camera. Kestrel's own dictation
 * and level meters don't count.
 */
export interface Calls {
  /** Whether a call is going on. It starts as soon as the microphone or camera is taken, and ends a few seconds after both are let go, so a call doesn't end while an app switches devices. */
  readonly active: boolean;
  readonly microphone: boolean;
  readonly camera: boolean;
  /** Runs `changed` when a call starts or ends. */
  onChanged(changed: () => void): Disposable;
}

export interface AudioLevels {
  /** Whether any app plays sound. */
  readonly playing: boolean;
  onPlayingChanged(changed: () => void): Disposable;
  /**
   * Starts listening to everything the computer plays, split into `bands` from low to high, 1 to 64. Kestrel only
   * listens while a listener is open and something plays, so an open listener costs nothing in silence.
   */
  listen(bands: number): AudioListener;
}

export interface AudioListener extends Disposable {
  /**
   * How loud it is now, and how loud each band is, low to high, all 0 to 1 and 0 while nothing plays. It's cheap
   * enough to read in every frame of a wallpaper layer; smooth the values to taste.
   */
  read(): AudioReading;
}

export interface AudioReading {
  readonly level: number;
  readonly bands: readonly number[];
}
