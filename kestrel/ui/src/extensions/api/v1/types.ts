/** Something an extension made that it, or Kestrel when the extension is turned off, can take away again. */
export interface Disposable {
  dispose(): void;
}

/**
 * What an extension may use beyond the basics, listed under `permissions` in its manifest. Settings and the store
 * show each one in plain words:
 *
 * - `wallpaper`: Draw over the wallpaper
 * - `quick-settings`: Add tiles to quick settings
 * - `taskbar`: Add buttons to the taskbar
 * - `search`: Add results to search
 * - `notifications`: Send notifications
 * - `weather`: See the weather where you are
 * - `location`: See roughly where you are
 * - `media`: See and control what's playing
 */
export type Permission = 'wallpaper' | 'quick-settings' | 'taskbar' | 'search' | 'notifications' | 'weather' | 'location' | 'media';

/** A permission, or `helper` for an extension whose manifest declares a native helper. */
export type Capability = Permission | 'helper';

type CamelCase<Name extends string> = Name extends `${infer Head}-${infer Tail}` ? `${Head}${Capitalize<CamelCase<Tail>>}` : Name;

/** The part of the API each capability unlocks, by the name it has on {@link Extension}. */
export interface Capabilities {
  wallpaper: Wallpaper;
  'quick-settings': QuickSettings;
  taskbar: Taskbar;
  search: Search;
  notifications: Notifications;
  weather: Weather;
  location: Location;
  media: Media;
  helper: Helper;
}

/** What every extension gets, whatever it asked for. */
export interface Basics {
  /** The id from the manifest, such as `com.example.Clock`. */
  readonly id: string;
  /** The version from the manifest. */
  readonly version: string;
  /** The extension's folder, for files it ships. */
  readonly path: string;
  readonly settings: Settings;
  readonly timers: Timers;
  readonly session: Session;
  readonly appearance: Appearance;
  /** A message from the extension's translations, in the language Kestrel uses. Kestrel turns the extension off and on again when the language changes. */
  t(id: string, args?: Record<string, string | number>): string;
  /** Runs `cleanup` when the extension is turned off, after everything it made through this API is gone. */
  onDisable(cleanup: () => void): Disposable;
}

/**
 * The object an extension's `enable` gets. Name the capabilities the manifest asks for, and only those show up:
 * `Extension<'wallpaper' | 'quick-settings'>` has `wallpaper` and `quickSettings` next to the basics.
 */
export type Extension<Granted extends Capability = never> = Basics & { readonly [Name in Granted as CamelCase<Name>]: Capabilities[Name] };

/** The default export of an extension's module. Kestrel calls it each time the extension is turned on. */
export type Enable<Granted extends Capability = never> = (extension: Extension<Granted>) => void | Promise<void>;

export type SettingValue = boolean | number | string;

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
}

export interface Session {
  /** Whether someone is using the desktop: signed in, and the screen isn't locked. */
  readonly active: boolean;
  onChanged(changed: () => void): Disposable;
}

/** A colour as `#rrggbb`. */
export type Color = string;

export interface Appearance {
  /** The accent colour the person chose or the wallpaper suggests. */
  readonly accent: Color;
  /** Whether the desktop uses its dark style. */
  readonly dark: boolean;
  onChanged(changed: () => void): Disposable;
}

/** A rectangle in pixels. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Wallpaper {
  /** Draws a shader over the wallpaper and under every window on each display. */
  addLayer(layer: LayerOptions): Layer;
}

export interface LayerOptions {
  /** GLSL declarations the shader needs: uniforms, constants and functions. */
  declarations?: string;
  /**
   * GLSL statements run for every pixel. They can read `vec2 layer_position`, the pixel's place in pixels from the
   * display's top left corner, and `vec2 layer_size`, and they set `vec4 layer_color` to the pixel's colour with
   * premultiplied alpha. It starts out transparent.
   */
  shader: string;
  /** Runs before every frame the layer draws, to set its uniforms. */
  frame(frame: LayerFrame): void;
  /** Whether the layer starts out active, as {@link Layer.active}. It does unless this is `false`. */
  active?: boolean;
}

export interface LayerFrame {
  /** Seconds since the layer was added. It wraps around every hour, so shaders keep their precision. */
  readonly time: number;
  /** Seconds since the previous frame, or 0 for the first frame after the layer appears. */
  readonly elapsed: number;
  /** The displays the layer shows on in this frame. */
  readonly displays: readonly LayerDisplay[];
}

export interface LayerDisplay {
  readonly width: number;
  readonly height: number;
  /** Windows on this display, topmost first, relative to its top left corner. */
  readonly windows: readonly Rect[];
  /** The taskbar on this display, relative to its top left corner. */
  readonly taskbar: Rect | null;
  /** Sets a `float`, `vec2`, `vec3` or `vec4` uniform, by how many values it gets. */
  uniform(name: string, ...values: number[]): void;
  /** Sets a uniform array, such as `vec4 rects[16]` with `components` 4. */
  uniformArray(name: string, components: 1 | 2 | 3 | 4, values: readonly number[]): void;
}

export interface Layer extends Disposable {
  /**
   * Whether the layer wants to draw. It only draws while it's active, the wallpaper shows on a display and animations
   * are on, fading in and out, and an inactive layer holds nothing on screen.
   */
  active: boolean;
}

/** A menu entry that runs something. */
export interface Action {
  label: string;
  /** Shows a check mark next to the label. */
  checked?: boolean;
  onActivate(): void;
}

/** `separator` draws a line; `settings` opens the extension's page in Settings. */
export type ActionItem = Action | 'separator' | 'settings';

/**
 * An entry in a quick settings menu. `{ setting }` shows a declared setting the way it fits the menu: a switch as an
 * entry with a check mark, a choice as one entry per option, and a slider as a slider.
 */
export type MenuItem = ActionItem | { setting: string };

/** An icon: a symbolic icon name such as `weather-showers-symbolic`, or the path of an SVG in the extension's folder. */
export type Icon = string;

export interface QuickSettings {
  /** Adds a toggle that people can place among the quick settings tiles, or remove. */
  addToggle(toggle: ToggleOptions): Toggle;
}

export interface ToggleOptions {
  title: string;
  icon: Icon;
  /** A line under the title, such as what the toggle is set to. */
  subtitle?: string | null;
  /** A switch setting the toggle reflects and turns on and off. Leave out `checked` and `onToggled` then. */
  setting?: string;
  checked?: boolean;
  onToggled?(checked: boolean): void;
  /** A menu behind the toggle's arrow. */
  menu?: MenuItem[];
}

export interface Toggle extends Disposable {
  update(changes: Partial<Omit<ToggleOptions, 'setting' | 'onToggled'>>): void;
}

export interface Taskbar {
  /** Adds a button next to the clock. */
  addItem(item: TaskbarItemOptions): TaskbarItem;
}

export interface TaskbarItemOptions {
  icon: Icon;
  /** What screen readers and the tooltip say. */
  label: string;
  onClick?(): void;
  /** A menu that opens on a right click, or on a click without `onClick`. */
  menu?: ActionItem[];
}

export interface TaskbarItem extends Disposable {
  update(changes: Partial<TaskbarItemOptions>): void;
}

export interface Search {
  /** Adds results to Start's search, under the provider's title. */
  addProvider(provider: SearchProvider): Disposable;
}

export interface SearchProvider {
  title: string;
  /** Results for what someone typed, best first. Kestrel shows the first few and drops answers to older queries. */
  search(query: string): readonly SearchResult[] | Promise<readonly SearchResult[]>;
}

export interface SearchResult {
  title: string;
  description?: string;
  icon?: Icon;
  activate(): void;
}

export interface Notifications {
  send(notification: NotificationOptions): Notification;
}

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: Icon;
  /** Shows the notification even during Do Not Disturb. Keep it for what can't wait. */
  urgent?: boolean;
  onActivate?(): void;
  actions?: Action[];
}

/** Disposing a notification withdraws it. */
export type Notification = Disposable;

export interface Helper {
  /**
   * Starts the native helper the manifest declares, in the extension's folder, with `LUFT_EXTENSION_DIR` set to it.
   * Kestrel stops it when the extension is turned off.
   */
  start(args?: string[]): HelperProcess;
}

export interface HelperProcess extends Disposable {
  readonly running: boolean;
  /** Writes a line to the helper's standard input. Lines are written in order. */
  write(line: string): Promise<void>;
  /** Runs `received` with each line the helper writes to its standard output. */
  onLine(received: (line: string) => void): Disposable;
  /** Runs `exited` when the helper stops, with its exit status. */
  onExit(exited: (status: number) => void): Disposable;
  /** Closes the helper's standard input, so it can finish by itself. Disposing stops it right away. */
  close(): void;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  /** How far off the position may be, in metres. */
  accuracy: number;
}

export interface Location {
  /** Roughly where the computer is, to the city, or `null` while location services are off or the position is unknown. */
  current(): Promise<Coordinates | null>;
}

export type WeatherCondition = 'clear' | 'clouds' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm';

export interface WeatherReport {
  condition: WeatherCondition;
  /** Degrees Celsius. */
  temperature: number;
  /** Millimetres an hour. */
  precipitation: number;
  /** Kilometres an hour. */
  wind: number;
  daytime: boolean;
  /** When the report was made, in milliseconds since 1970. */
  time: number;
}

export interface Weather {
  /** The weather where the computer is, or `null` while location services are off or the weather can't be fetched. */
  current(): Promise<WeatherReport | null>;
  /** Runs `changed` with each new report, about every half hour. */
  onChanged(changed: (report: WeatherReport) => void): Disposable;
}

export interface MediaPlayer {
  /** The app that plays, as its desktop file id when known. */
  readonly app: string | null;
  readonly title: string;
  readonly artist: string;
  readonly playing: boolean;
  playPause(): void;
  next(): void;
  previous(): void;
}

export interface Media {
  /** The player people would control with their media keys, if anything plays or paused. */
  readonly player: MediaPlayer | null;
  onChanged(changed: () => void): Disposable;
}

/** Which extension API a manifest targets. Kestrel keeps every version it shipped working. */
export type ApiVersion = 1;

interface SettingBase {
  key: string;
  /** A message id from the extension's translations: its value is the title, its `.description` attribute the line under it. */
  label: string;
  /** Shows the setting only while this switch, declared before it, is on. */
  depends?: string;
}

export interface SwitchSetting extends SettingBase {
  type: 'switch';
  default: boolean;
}

export interface ChoiceOption {
  value: string;
  /** A message id from the extension's translations. */
  label: string;
}

export interface ChoiceSetting extends SettingBase {
  type: 'choice';
  default: string;
  options: ChoiceOption[];
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
  /** `#rrggbb`, or `accent` for the accent colour. */
  default: string;
  /** Colours offered first, each `#rrggbb` or `accent`. Settings also offers any other colour. */
  swatches?: ChoiceOption[];
}

export type SettingDescription = SwitchSetting | ChoiceSetting | SliderSetting | ColorSetting;

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
  /** A native program in the extension's folder that {@link Helper} starts. */
  helper?: { path: string };
}
