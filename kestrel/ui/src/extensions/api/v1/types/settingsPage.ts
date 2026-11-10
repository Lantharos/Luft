import type { Disposable, Permission } from '../types.js';

/** Which extension API a manifest targets. Kestrel keeps every version it shipped working. */
export type ApiVersion = 1;

/**
 * A Settings page besides the extension's own where a setting can show too, with the permission that allows it:
 * `appearance` (`wallpaper`), `taskbar` (`taskbar`), `sound` (`sounds` or `audio-levels`) and `input` (`typing` or `input-sounds`).
 */
export type SettingsPageId = 'appearance' | 'taskbar' | 'sound' | 'input';

/**
 * The values of another setting that a setting shows for: any of a list, or a range of a slider, both ends included.
 * For a `choices` setting, the list names options, and any of them being picked is enough.
 */
export type SettingCondition = readonly (boolean | number | string)[] | SliderRange;

/** Part of a slider's range; an end left out is open. */
export interface SliderRange {
  min?: number;
  max?: number;
}

interface SettingBase {
  key: string;
  /** A message id from the extension's translations: its value is the title, its `.description` attribute the line under it. */
  label: string;
  /**
   * Shows the setting only while this setting, declared before it, is itself showing and has a value in {@link when}.
   * Without `when` it has to be a switch, and the setting shows while that switch is on.
   */
  depends?: string;
  /** The values of {@link depends} the setting shows for, such as `["compact", "full"]`, `[false]` or `{ min = 0.5 }`. */
  when?: SettingCondition;
  /** Also shows the setting on this page of Settings, under the extension's name. */
  page?: SettingsPageId;
  /** Never shows it: the extension keeps the value itself, such as what it found, for other settings to {@link depends} on. */
  hidden?: boolean;
}

export interface SwitchSetting extends SettingBase {
  type: 'switch';
  default: boolean;
}

export interface ChoiceOption {
  value: string;
  /** A message id from the extension's translations. */
  label: string;
  /** A picture of the option, a PNG, JPEG, WebP or SVG in the extension's folder. When every option has one, Settings offers them as pictures. */
  image?: string;
}

export interface ChoiceSetting extends SettingBase {
  type: 'choice';
  default: string;
  options: ChoiceOption[];
}

/** Any number of options at once, such as which edges of the display to use. Its value lists them in the order they're declared. */
export interface ChoicesSetting extends SettingBase {
  type: 'choices';
  default: readonly string[];
  options: ChoiceOption[];
  /** The fewest options that can be picked. Settings keeps the last ones from being turned off. */
  min?: number;
}

export interface SliderSetting extends SettingBase {
  type: 'slider';
  default: number;
  min: number;
  max: number;
  step?: number;
  /** `percent` shows the value as a percentage of the range. */
  unit?: 'percent';
}

export interface ColorSetting extends SettingBase {
  type: 'color';
  /** `#rrggbb`, `accent` for the accent colour, or `wallpaper` for the colour the wallpaper suggests. */
  default: string;
  /** Colours offered first, each `#rrggbb`, `accent` or `wallpaper`. Settings also offers any other colour. */
  swatches?: ChoiceOption[];
}

export type SettingDescription = SwitchSetting | ChoiceSetting | ChoicesSetting | SliderSetting | ColorSetting;

/** A keyboard shortcut the extension offers. People can change it in Settings → Keyboard. */
export interface ShortcutDescription {
  key: string;
  /** A message id from the extension's translations, saying what the shortcut does. */
  label: string;
  /**
   * What it's set to at first, such as `<Super><Alt>v`. It stays unset when this is taken by Luft, an app or another
   * extension, or isn't a combination people can't type by accident.
   */
  default?: string;
}

/**
 * The extension's page in Settings → Extensions. Without a description it lists the declared settings; with one it
 * shows what `build` returns, below the switch that turns the extension on and off.
 */
export interface SettingsPage {
  /**
   * Describes the page. Kestrel calls `build` only while Settings shows the page: when it opens, after a declared
   * setting changes, and after {@link refresh}. While the extension is off, Settings lists its declared settings.
   */
  describe(build: () => readonly PageSection[]): Disposable;
  /** Asks for the page to be built again, when something only the extension knows has changed. */
  refresh(): void;
}

export interface PageSection {
  title?: string;
  description?: string;
  items: readonly PageItem[];
}

/**
 * A row of a Settings page. `{ setting }` shows a declared setting the way Settings shows it; the others show values
 * the extension keeps itself, and their callbacks run in the extension. Images are files in the extension's folder or
 * data folder.
 */
export type PageItem =
  | { setting: string }
  | PageRow | PageSwitch | PageChoice | PageSlider | PageButton | PageEntry | PagePreview | PageSprite | PageList | PageTaskbarPlace | { type: 'text'; text: string };

/**
 * Where one of the extension's taskbar elements sits, chosen by people, never by the extension. On a taskbar that's
 * one bar, Settings offers places such as beside the apps or next to the tray; with separate islands, it points to
 * editing the taskbar, where people move elements themselves.
 */
export interface PageTaskbarPlace {
  type: 'taskbar-place';
  /** The element's key, as given to {@link Taskbar.addElement}. */
  element: string;
}

interface PageControl {
  title: string;
  description?: string;
}

/** A line with a value at its end, which opens something when `onActivate` is there. */
export interface PageRow extends PageControl {
  type: 'row';
  value?: string;
  onActivate?(): void;
}

export interface PageSwitch extends PageControl {
  type: 'switch';
  checked: boolean;
  onToggled(checked: boolean): void;
}

export interface PageChoice extends PageControl {
  type: 'choice';
  value: string;
  /** Labels are text here, not message ids. */
  options: readonly { value: string; label: string; image?: string }[];
  onChanged(value: string): void;
}

export interface PageSlider extends PageControl {
  type: 'slider';
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: 'percent';
  onChanged(value: number): void;
}

export interface PageButton extends PageControl {
  type: 'button';
  label: string;
  danger?: boolean;
  onActivate(): void;
}

export interface PageEntry extends PageControl {
  type: 'entry';
  value: string;
  placeholder?: string;
  /** Runs when people press Enter or leave the field after changing it. */
  onSubmit(text: string): void;
}

/** A picture across the page, such as what the current choices look like. */
export interface PagePreview {
  type: 'preview';
  image: string;
  /** What the picture shows, for screen readers. */
  description: string;
}

/** A row with a small animation from a sprite sheet at its start, a switch and buttons of its own, all optional. */
export interface PageSprite extends PageControl {
  type: 'sprite';
  /** The sheet, a PNG, JPEG or WebP of square frames. */
  image: string;
  /** A frame's width and height in the picture's own pixels. */
  cell: number;
  /** How many frames fit across the sheet. */
  columns: number;
  /** The frames to play in a loop, counting from the top left, row by row. */
  frames: readonly number[];
  /** Frames a second. */
  rate: number;
  checked?: boolean;
  onToggled?(checked: boolean): void;
  actions?: readonly { label: string; danger?: boolean; onActivate(): void }[];
}

export interface PageList {
  type: 'list';
  items: readonly { title: string; description?: string; image?: string; actions?: readonly { label: string; danger?: boolean; onActivate(): void }[] }[];
  /** What the list says while it's empty. */
  empty?: string;
}

/** `extension.toml`, the manifest at the top of an extension's folder. */
export interface Manifest {
  /** Reverse DNS, such as `com.example.Clock`. The folder has the same name. */
  id: string;
  /** The name in English. A message `extension-name` in the translations replaces it in other languages. */
  name: string;
  /** One sentence in English. A message `extension-description` replaces it in other languages. */
  description?: string;
  version: string;
  api: ApiVersion;
  permissions?: Permission[];
  settings?: SettingDescription[];
  shortcuts?: ShortcutDescription[];
  /** A native program in the extension's folder that {@link Helper} starts. */
  helper?: {
    path: string;
    /** Arguments to run the helper with once when people turn the extension off or remove it, so it can undo what it did elsewhere. */
    turnedOff?: string[];
  };
  /**
   * The hosts {@link Network} may connect to, such as `api.example.com`, or `localhost:8787` while developing, and the
   * ports the extension's helper listens on, which Luft's firewall opens on networks people trust.
   */
  network?: { hosts: string[]; listen: ListenPort[] };
}

/** A port an extension's helper takes connections or datagrams on. */
export interface ListenPort {
  port: number;
  protocol: 'tcp' | 'udp';
}
