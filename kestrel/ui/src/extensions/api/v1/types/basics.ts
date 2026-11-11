import type { SettingsPage } from './settingsPage.js';
import type { Capabilities, Capability, Disposable } from '../types.js';

/** What every extension gets, whatever it asked for. */
export interface Basics {
  /** The id from the manifest, such as `com.example.Clock`. */
  readonly id: string;
  /** The version from the manifest. */
  readonly version: string;
  /** The extension's folder, for files it ships. */
  readonly path: string;
  /** A folder of the extension's own for files it writes, kept across updates and deleted when it's removed. Kestrel makes it on first use. */
  readonly dataPath: string;
  readonly settings: Settings;
  /** The extension's own page in Settings. */
  readonly settingsPage: SettingsPage;
  /** Small values the extension keeps, such as what someone last picked. */
  readonly storage: Storage;
  /** Passwords and sign-in tokens, kept in the keyring. */
  readonly secrets: Secrets;
  /** Other extensions, to ask them to do something or answer what they ask. */
  readonly peers: Peers;
  readonly timers: Timers;
  readonly session: Session;
  readonly desktop: Desktop;
  readonly power: Power;
  readonly appearance: Appearance;
  /** A message from the extension's translations, in the language Kestrel uses. Kestrel turns the extension off and on again when the language changes. */
  t(id: string, args?: Record<string, string | number>): string;
  /**
   * Opens an `https:` link in the browser, a `mailto:` address, a `schelf:` page, or a file or folder in the app that opens
   * it, such as `https://luft.computer` or `file://` and a path. Files have to be in {@link path}, {@link dataPath} or what
   * people chose with {@link chooseFiles}, and can't be programs or launchers. Anything else throws.
   */
  open(uri: string): void;
  /** Opens the extension's page in Settings. */
  openSettings(): void;
  /**
   * Asks people to pick files with the file chooser, right after they used the extension, such as from a button on
   * its Settings page. Kestrel copies what they picked into {@link dataPath} and returns the copies' paths, or none
   * when they cancel, so the extension never depends on where the files were.
   */
  pickFiles(options: PickOptions): Promise<string[]>;
  /**
   * Asks people to choose files, or a folder, with the file chooser, right after they used the extension. Returns their
   * full paths where they are, or none when they cancel, for what the extension hands to its helper or saves into,
   * such as a folder to keep what it receives in.
   */
  chooseFiles(options: ChooseOptions): Promise<string[]>;
  /** Deletes a file or folder in {@link dataPath}, such as something picked that people no longer use. */
  deleteFile(path: string): void;
  /** Reads a text file in the extension's folder or {@link dataPath}, such as a manifest in a folder people picked. Returns `null` when it isn't there. */
  readText(path: string): string | null;
  /**
   * Writes a text file in {@link dataPath}, off the main thread and in one go: the old contents stay whole until the
   * new ones are safely on disk, so a crash or a power cut leaves one or the other, never a part.
   */
  writeText(path: string, text: string): Promise<void>;
  /**
   * Asks people where to save a text file with the file chooser, right after they used the extension. Returns whether
   * it was saved, or `false` when they cancel.
   */
  saveFile(options: SaveOptions): Promise<boolean>;
  /** Runs `cleanup` when the extension is turned off, after everything it made through this API is gone. */
  onDisable(cleanup: () => void): Disposable;
}

type CamelCase<Name extends string> = Name extends `${infer Head}-${infer Tail}` ? `${Head}${Capitalize<CamelCase<Tail>>}` : Name;

/**
 * The object an extension's `enable` gets. Name the capabilities the manifest asks for, and only those show up:
 * `Extension<'wallpaper' | 'quick-settings'>` has `wallpaper` and `quickSettings` next to the basics.
 */
export type Extension<Granted extends Capability = never> = Basics & { readonly [Name in Granted as CamelCase<Name>]: Capabilities[Name] };

/** The default export of an extension's module. Kestrel calls it each time the extension is turned on. */
export type Enable<Granted extends Capability = never> = (extension: Extension<Granted>) => void | Promise<void>;

/** A switch's `boolean`, a slider's `number`, a choice's or colour's `string`, or the options picked in a `choices` setting. */
export type SettingValue = boolean | number | string | readonly string[];

/** The settings declared in the manifest, as the person set them in Settings. */
export interface Settings {
  /** The current value of a declared setting, or its default. */
  get<Value extends SettingValue = SettingValue>(key: string): Value;
  /** Stores a new value for a declared setting. Settings shows it right away. */
  set(key: string, value: SettingValue): void;
  /** Runs `changed` with the key whenever a setting changes, here or in Settings. */
  onChanged(changed: (key: string) => void): Disposable;
}

export interface Timers {
  /** Runs `callback` once, after `milliseconds`. */
  timeout(milliseconds: number, callback: () => void): Disposable;
  /** Runs `callback` every `milliseconds` until disposed. */
  interval(milliseconds: number, callback: () => void): Disposable;
  /**
   * Runs `changed` when the time jumped instead of ticking by. Timers only count time the computer is awake, so
   * something waiting for a time of day sets its timer again here, and needs no timer of its own to notice.
   */
  onClockChanged(changed: (cause: ClockChange) => void): Disposable;
}

/** Why the time jumped: the computer woke from sleep, the clock was set, or the time zone changed. */
export type ClockChange = 'wake' | 'clock' | 'time-zone';

export interface Session {
  /** Whether someone is using the desktop: signed in, and the screen isn't locked. */
  readonly active: boolean;
  onChanged(changed: () => void): Disposable;
}

export interface Desktop {
  /**
   * Whether the wallpaper shows on any display: windows leave some of it uncovered, nothing runs full screen and the
   * screen isn't locked.
   */
  readonly wallpaperVisible: boolean;
  onChanged(changed: () => void): Disposable;
}

export interface Power {
  /** Whether the computer runs on its battery. */
  readonly onBattery: boolean;
  /** Whether the computer saves power: the power saver mode is on. Do less while it is. */
  readonly saving: boolean;
  onChanged(changed: () => void): Disposable;
}

/** A colour as `#rrggbb`. */
export type Color = string;

export interface Appearance {
  /** The accent colour the person chose or the wallpaper suggests. */
  readonly accent: Color;
  /** The colour the wallpaper suggests, whatever accent the person chose. */
  readonly wallpaperAccent: Color;
  /** Whether the desktop uses its dark style. */
  readonly dark: boolean;
  /** The colours of the current style by role, such as `surface` and `onPrimary`, the palette Luft's apps are drawn with. */
  readonly colors: Readonly<Record<string, Color>>;
  /** The family of the font people chose for the interface. */
  readonly font: string;
  /** How much larger people want text, where 1 is the usual size. */
  readonly textScale: number;
  /** Whether people chose square corners for windows and what's in them. */
  readonly squareCorners: boolean;
  /** Whether people asked for less motion, or animations are off. Keep things still or slow while it's on. */
  readonly reducedMotion: boolean;
  onChanged(changed: () => void): Disposable;
}

export interface PickOptions {
  /** What the file chooser says it's for, in the language Kestrel uses. */
  title: string;
  /**
   * Pictures (PNG, WebP, SVG, GIF or JPEG), sounds (Ogg, FLAC, WAV or MP3), calendars (iCalendar `.ics`), or a folder
   * of up to 32 files of up to 8 MB each, without the folders inside it, for something that's several files together.
   */
  kind: 'images' | 'sounds' | 'calendars' | 'folder';
  /** Lets people pick several at once. */
  multiple?: boolean;
}

export interface ChooseOptions {
  /** What the file chooser says it's for, in the language Kestrel uses. */
  title: string;
  /** Asks for a folder instead of files. */
  folder?: boolean;
  /** Lets people choose several at once. */
  multiple?: boolean;
}

export interface SaveOptions {
  /** What the file chooser says it's for, in the language Kestrel uses. */
  title: string;
  /** The file name it suggests, such as `reminders.ics`. */
  name: string;
  /** What goes in the file. */
  text: string;
}

/** What {@link Storage} keeps: anything JSON can hold. */
export type Stored = null | boolean | number | string | readonly Stored[] | { readonly [key: string]: Stored };

/** Values kept across restarts and updates, up to 1 MB in all, and deleted when the extension is removed. */
export interface Storage {
  get<Value extends Stored = Stored>(key: string): Value | undefined;
  /** Keeps a value. Kestrel writes it to disk soon after, and when the extension is turned off. */
  set(key: string, value: Stored): void;
  delete(key: string): void;
  keys(): string[];
}

/**
 * Secrets kept in the person's keyring, such as a token from signing in to a service, encrypted and unlocked with their
 * account. They're deleted when the extension is removed.
 */
export interface Secrets {
  /** The secret kept under `key`, or `null` when there's none or the keyring can't be reached. */
  get(key: string): Promise<string | null>;
  set(key: string, secret: string): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * Requests between extensions, such as a timer asking Soundscapes to play while it runs. Both sides take part: an
 * extension only answers the requests it handles, and values pass as copies of what JSON can hold.
 */
export interface Peers {
  /** Answers requests named `name` from other extensions with what `answer` returns, until disposed. */
  handle(name: string, answer: (value: Stored, from: string) => Stored | void | Promise<Stored | void>): Disposable;
  /** Whether the extension with this id runs and answers requests named `name`. */
  handles(id: string, name: string): boolean;
  /** Asks another extension and returns its answer. It rejects when that extension doesn't run, doesn't handle `name` or fails. */
  request(id: string, name: string, value?: Stored): Promise<Stored | undefined>;
  /** Runs `changed` when an extension starts or stops answering a request, such as when one is installed or turned off. */
  onChanged(changed: () => void): Disposable;
}
