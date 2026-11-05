// Written by kestrel/ui/extensionApi.ts from kestrel/ui/src/extensions/api/v1/types.ts. Change that file, then run it again.

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
 * - `popups`: Show panels and small windows
 * - `typing`: Type into other apps
 * - `sounds`: Play sounds
 * - `audio-levels`: Follow the beat of what's playing
 * - `calls`: Know when you're in a call
 * - `locked-sounds`: Keep playing sounds while the screen is locked
 * - `input-sounds`: Play a sound when you type and click, without seeing your keys
 * - `do-not-disturb`: Hold back notifications for a while
 * - `screen-effects`: Draw over and change how your windows and the whole screen look
 */
export type Permission =
  | 'wallpaper' | 'quick-settings' | 'taskbar' | 'search' | 'notifications' | 'weather' | 'location' | 'media'
  | 'popups' | 'typing' | 'sounds' | 'audio-levels' | 'calls' | 'locked-sounds' | 'input-sounds' | 'do-not-disturb' | 'screen-effects';

/**
 * A permission, `helper` for an extension whose manifest declares a native helper, `shortcuts` for one that declares
 * keyboard shortcuts, or `network` for one that names the hosts it connects to.
 */
export type Capability = Permission | 'helper' | 'shortcuts' | 'network';

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
  popups: Popups;
  typing: Typing;
  sounds: Sounds;
  'audio-levels': AudioLevels;
  calls: Calls;
  'locked-sounds': LockedSounds;
  'input-sounds': InputSounds;
  'do-not-disturb': DoNotDisturb;
  'screen-effects': ScreenEffects;
  helper: Helper;
  shortcuts: Shortcuts;
  network: Network;
}

/** Why Kestrel took an effect off the screen: its shader didn't compile, or frames got very slow with it. */
export type ScreenEffectProblem = 'shader' | 'slow';

/** A window as effects see it. */
export interface EffectWindow {
  /** The app's desktop file id, such as `com.lantharos.Tern.desktop`, or `null` for a window of no known app. */
  appId: string | null;
  kind: 'normal' | 'dialog' | 'utility';
  focused: boolean;
  maximized: boolean;
  fullscreen: boolean;
}

export interface ScreenEffectOptions {
  /** The effect's name, translated, for the notification when Kestrel has to turn it off. */
  label: string;
  /**
   * Whether it stays on over something fullscreen. Off, which is the default, it comes off a fullscreen window, or the
   * display with one, so games and videos go straight to the screen. On, the compositor has to draw every frame.
   */
  fullscreen?: boolean;
  /**
   * Whether it moves by itself: `true` for 30 frames a second, or a number of them. Kestrel sets its time uniform on each,
   * and stops while nobody would see it: on the lock screen, with the display off, after 30 seconds without input, in power
   * saving and with reduced motion. Leave it off when nothing moves, so nothing draws until something changes.
   */
  animated?: boolean | number;
  /** Called after Kestrel turned the effect off and told the person, so the extension can show it's off. */
  onProblem?(problem: ScreenEffectProblem, detail: string): void;
}

/** What every effect can do after it's added. */
export interface ScreenEffectBase extends Disposable {
  /** Why Kestrel took it off the screen, or `null`. It stays off until it's added again. */
  readonly problem: ScreenEffectProblem | null;
  /** Sets a `float`, `vec2`, `vec3` or `vec4` uniform of its shader. */
  set(name: string, ...values: number[]): void;
}

export interface WindowEffectOptions extends ScreenEffectOptions {
  /** GLSL declarations for the shader, such as uniforms and functions. */
  declarations?: string;
  /** The GLSL itself. */
  shader: string;
  /** Whether the effect goes on this window. It's asked again when the window changes, and after {@link WindowEffectHandle.refresh}. */
  match(window: EffectWindow): boolean;
  /** Asks {@link match} again whenever the focused window changes. */
  followsFocus?: boolean;
}

export interface WindowEffectHandle extends ScreenEffectBase {
  /** Asks {@link WindowEffectOptions.match} about every window again, after the extension's rules changed. */
  refresh(): void;
}

/**
 * A shader over a window's own pixels, such as a CRT. It costs an offscreen texture for each window it's on, redrawn when
 * the window changes. The shader gets `vec2 window_uv` and `vec4 window_color`, premultiplied, and changes `window_color`;
 * `window_sample(position)` reads any other pixel, `window_size` is the frame in pixels, `window_frame` is where the frame
 * sits in the texture, which also holds the app's own shadows, as x, y, width and height from 0 to 1, `window_inside(position)`
 * says whether a position is in the frame, and `window_time` follows {@link ScreenEffectOptions.animated}. Keep alpha as it is
 * unless the window is meant to get holes: rounded corners are already in it.
 */
export type WindowShaderOptions = WindowEffectOptions;

/**
 * Something drawn over a window or around it, such as a border or a glow. It never reads what's in the window, and costs
 * no offscreen texture. The shader gets `vec2 outline_position` in pixels from the frame's top left corner and sets
 * `vec4 outline_color`, premultiplied, so a colour with alpha 0 adds light. `outline_distance(position)` is the distance
 * to the window's edge in pixels, following its rounded corners, negative inside; `outline_inside(position)` is how much of
 * a pixel is inside; `outline_size`, `outline_scale` and `outline_time` say the rest.
 */
export interface WindowOverlayOptions extends WindowEffectOptions {
  /** How many pixels it may draw outside the frame. */
  margin?: number;
  /** How many pixels it draws inside the frame. Without it, it covers the whole window. Keep a border to a band, so what's in the window doesn't redraw with it. */
  inset?: number;
}

/**
 * A shader a window opens or closes through, over the window with its shadow and anything drawn with it, as {@link WindowShaderOptions}
 * with `window_progress` going from 0 to 1. It replaces how the window normally appears or goes, and costs nothing between
 * those moments. People with reduced motion get the normal animation.
 */
export interface WindowTransitionOptions extends WindowEffectOptions {
  kinds: readonly ('open' | 'close')[];
  /** How long it lasts, in milliseconds. */
  duration: number;
}

export interface FilterPass {
  declarations?: string;
  shader: string;
  /** The size it draws at as a part of the display's, for the passes before the last, which is always the display's size. */
  scale?: number;
}

/**
 * Shaders over a whole display, after everything else is drawn. A pass gets `vec2 filter_uv` and `vec4 filter_color`, what's
 * on the display there, and changes `filter_color`; `filter_scene(position)` reads any other pixel, `cogl_sampler1` and up
 * are what earlier passes drew, `filter_size` is the display in pixels and `filter_time` follows
 * {@link ScreenEffectOptions.animated}. It costs one pass over the display each time something changes on it, and none
 * while nothing does. One display takes one filter, so put everything into one shader: with two, the first waits until the
 * second is gone. They stay off on the lock screen.
 */
export interface DesktopFilterOptions extends ScreenEffectOptions {
  passes: readonly FilterPass[];
  /** Whether it moves or bends the picture. The pointer is then drawn into the picture too, or it would point at the wrong thing. */
  warps?: boolean;
  /** Whether screenshots and recordings show it. Like night light, they don't by default. */
  captured?: boolean;
}

export interface DesktopFilter extends ScreenEffectBase {
  /** Changes the shaders without a flash. A shader that doesn't compile turns the filter off. */
  setPasses(passes: readonly FilterPass[]): void;
  setCaptured(captured: boolean): void;
}

export type EffectSurface = 'taskbar' | 'quick-settings' | 'start' | 'notifications';

/**
 * Something drawn over Kestrel's own surfaces, such as lines across the taskbar, as {@link WindowOverlayOptions} without a
 * margin. It moves and fades with them, and costs a rectangle each time they draw.
 */
export interface SurfaceOverlayOptions extends ScreenEffectOptions {
  surfaces: readonly EffectSurface[];
  declarations?: string;
  shader: string;
}

/** Decoration Luft's own apps draw themselves, through their shared styles. */
export type AppLines = 'none' | 'lines' | 'scanlines';

/** A shader to try without showing it. */
export interface ShaderSource {
  kind: 'window' | 'overlay' | 'filter';
  declarations?: string;
  shader: string;
}

/**
 * Shaders on windows, on whole displays and on Kestrel's surfaces. An effect whose shader doesn't compile, or that makes frames
 * very slow, comes off the screen by itself, with a notification; the extension keeps running. A shortcut of Kestrel's, not of
 * any extension, turns all of them off at once and they stay off until people turn them back on. Nothing is attached and
 * nothing runs for an effect that's disabled, and without an effect nothing here costs anything.
 */
export interface ScreenEffects {
  /** Whether the shortcut turned every effect off. Effects added meanwhile wait until it's over. */
  readonly off: boolean;
  /** What the shortcut is set to, for showing people, or `null` when it's unset. */
  readonly shortcut: string | null;
  onOffChanged(changed: () => void): Disposable;
  /** Brings effects back, right after people used the extension. */
  turnBackOn(): void;
  /** The apps on this computer, for rules about them. */
  apps(): { id: string; name: string }[];
  /** Tries a shader on this computer's driver and says what's wrong with it, or `null`. */
  check(source: ShaderSource): string | null;
  addWindowShader(options: WindowShaderOptions): WindowEffectHandle;
  addWindowOverlay(options: WindowOverlayOptions): WindowEffectHandle;
  addWindowTransition(options: WindowTransitionOptions): ScreenEffectBase;
  addDesktopFilter(options: DesktopFilterOptions): DesktopFilter;
  addSurfaceOverlay(options: SurfaceOverlayOptions): ScreenEffectBase;
  /** Asks Luft's apps to draw lines through their own styles. Their pixels stay theirs; this goes when the extension does. */
  setAppLines(style: AppLines): void;
}

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
  /** Opens a web link in the browser, or a file or folder in the app that opens it, such as `https://luft.computer` or `file:///home/…`. */
  open(uri: string): void;
  /** Opens the extension's page in Settings. */
  openSettings(): void;
  /**
   * Asks people to pick files with the file chooser, right after they used the extension, such as from a button on
   * its Settings page. Kestrel copies what they picked into {@link dataPath} and returns the copies' paths, or none
   * when they cancel, so the extension never depends on where the files were.
   */
  pickFiles(options: PickOptions): Promise<string[]>;
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

/** A rectangle in pixels. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A window or a piece of the taskbar the way it shows: its rectangle with its rounded corners. */
export interface Outline extends Rect {
  /** How far each corner is rounded in pixels, top left, top right, bottom right and bottom left; 0 for a square corner. */
  radii: readonly [number, number, number, number];
}

/** A window or a piece of the taskbar, with an id that stays the same while it moves or changes size. */
export interface Surface extends Outline {
  /** Stays the same for as long as the window or piece of the taskbar exists. */
  id: string;
}

/** A piece of the taskbar the way it shows, and which edge of the display it sits on. */
export interface TaskbarOutline extends Outline {
  edge: 'top' | 'bottom' | 'left' | 'right';
}

export interface Wallpaper {
  /** Draws a shader across each display, over the wallpaper. */
  addLayer(layer: LayerOptions): Layer;
  /**
   * Adds small pictures that live on the desktop, between the wallpaper and the windows or standing on a window, and that people can pick up.
   * They only take clicks on what shows of them; the desktop keeps every other pixel.
   * Each one costs nothing until it's told to change: unlike a layer, they run no shader and no frame clock, and only
   * the few pixels a sprite changes get drawn again.
   */
  addSprites(): Sprites;
  /** What's on each display right now, read when asked. */
  readonly surfaces: readonly SurfaceDisplay[];
  /**
   * Runs `changed` before the next frame after windows or the taskbar moved, changed size, appeared or went, or the
   * displays changed, at most once a frame. Nothing runs while nothing changes.
   */
  onSurfacesChanged(changed: () => void): Disposable;
  /**
   * Hears about the pointer and fingers on the bare desktop and on the extension's own sprites, inside the areas asked
   * for and nowhere else. Windows in front stop it, nothing reaches the extension over anything else, and it costs
   * nothing while the pointer stays out of those areas. It only listens: a press on the bare desktop still does what
   * it always does.
   */
  followPointer(options: PointerFollowOptions): PointerFollow;
}

/** A part of a display, relative to its top left corner, where an extension wants to hear about the pointer. */
export interface PointerArea extends Rect {
  /** The display, as in {@link SurfaceDisplay.index}. */
  display: number;
}

export interface PointerFollowOptions {
  areas: readonly PointerArea[];
  onPointer(event: DesktopPointerEvent): void;
}

export interface PointerFollow extends Disposable {
  /** Replaces the areas, such as when things moved. */
  setAreas(areas: readonly PointerArea[]): void;
}

/** Something the pointer or a finger did on the desktop. */
export interface DesktopPointerEvent {
  /** 0 for the mouse. Each finger has its own number while it's down, so several can be told apart. */
  readonly id: number;
  readonly kind: 'mouse' | 'touch';
  /**
   * `down` and `up` are the primary button or a finger. `gone` means it left the areas or the desktop, such as when a
   * window opened under it, and nothing more comes until it's back. A finger that's lifted sends only `up`.
   */
  readonly phase: 'move' | 'down' | 'up' | 'gone';
  /** The display, as in {@link SurfaceDisplay.index}. Meaningless for `gone`, like `x` and `y`. */
  readonly display: number;
  readonly x: number;
  readonly y: number;
  /** When it happened, in milliseconds, for working out how fast it goes. */
  readonly time: number;
  /**
   * The {@link SpriteOptions.pressable} sprite the press landed on, until it's let go. Such a press stays with that
   * sprite wherever it goes and reports `move`s outside the areas too. Null on the bare desktop.
   */
  readonly sprite: Sprite | null;
}

export interface SurfaceDisplay {
  /** Which display this is, as Kestrel numbers them. It can change when displays come and go. */
  readonly index: number;
  /** What the display is known by across restarts and being plugged in again, for keeping things per display. */
  readonly id: string;
  readonly primary: boolean;
  readonly width: number;
  readonly height: number;
  /** How many of the screen's own pixels one pixel here takes up, such as 1.5 at 150%. */
  readonly scale: number;
  /** Where windows go on this display, without the taskbar, relative to its top left corner. */
  readonly workArea: Rect;
  /** Whether a window runs full screen here. */
  readonly fullscreen: boolean;
  /** Windows on this display, topmost first, relative to its top left corner. */
  readonly windows: readonly Surface[];
  /** What shows of the taskbar, relative to the display's top left corner: the bar, or each island of a taskbar in islands. */
  readonly taskbar: readonly Surface[];
}

export interface SpriteSheetOptions {
  /** A picture in the extension's folders, PNG, WebP or JPEG, of square frames in a grid, read row by row. */
  path: string;
  /** A frame's width and height in the picture's own pixels. Its size must be a whole number of frames each way. */
  cell: number;
  /** For {@link SpriteOptions.smooth} sprites. Keeps half as much in memory, since they flip without a mirrored copy. */
  smooth?: boolean;
}

/** A picture cut into frames. Frames count from the top left, row by row. */
export interface SpriteSheet {
  readonly columns: number;
  readonly rows: number;
  /** A frame's width and height in the picture's own pixels. */
  readonly cell: number;
}

/** Where a sprite shows, by the middle of its bottom edge, and what it looks like there. */
export interface SpritePlace {
  /** The display, as in {@link SurfaceDisplay.index}. */
  display: number;
  /** Pixels from the display's left edge to the sprite's middle, or from the window's left edge with {@link SpritePlace.on}. */
  x: number;
  /** Pixels from the display's top edge to the sprite's feet, or from the window's top edge with {@link SpritePlace.on}. */
  y: number;
  /** Which frame of its sheet shows. */
  frame: number;
  /** Mirrors it, to face the other way. */
  flipped?: boolean;
  /**
   * The window it stands on, as in {@link Surface.id}. It then shows right in front of that window instead of below
   * all of them, and goes wherever the window goes by itself, in step with it on every frame, however the window moves.
   * Nothing happens if that window has just gone.
   */
  on?: string;
  /** Only for {@link SpriteOptions.smooth} sprites: degrees clockwise around its pivot. */
  rotation?: number;
  /** Only for {@link SpriteOptions.smooth} sprites: how much shows, from 0 to 1. At 0 it costs nothing. */
  opacity?: number;
  /** Only for {@link SpriteOptions.smooth} sprites: stretches it around its pivot. */
  scaleX?: number;
  scaleY?: number;
}

export interface SpriteOptions {
  sheet: SpriteSheet;
  /**
   * About how tall it shows, in pixels. Kestrel takes the nearest whole number of screen pixels for each pixel of the
   * sheet on each display, so the picture stays crisp at every display scale; {@link Sprite.sizeOn} says what that came to.
   */
  height: number;
  /**
   * For painted art rather than pixel art. It shows at exactly `height`, filtered and not snapped to pixels, and can
   * turn, fade and stretch through {@link SpritePlace}. Load its sheet with {@link SpriteSheetOptions.smooth}. Moving
   * one never asks for a layout. `onClick` and picking up don't apply; use `pressable` instead.
   */
  smooth?: boolean;
  /**
   * Only for smooth sprites: the point of the frame that {@link SpritePlace} puts in place and that it turns around, as
   * parts of its width and height. The middle of the bottom edge, `[0.5, 1]`, without it.
   */
  pivot?: readonly [number, number];
  /**
   * Only for smooth sprites: takes presses on what shows of it and reports them through
   * {@link Wallpaper.followPointer}, each finger on its own, so people can hold several at once.
   */
  pressable?: boolean;
  /** Runs when someone clicks or taps it without moving it. */
  onClick?(): void;
  /**
   * Runs when someone starts dragging it. Kestrel moves it with the pointer, above the windows, until it's dropped.
   * Without this people can't pick it up.
   */
  onPicked?(): void;
  /** Runs as it's carried, with where its feet are. */
  onCarried?(point: SpritePoint): void;
  /** Runs when it's let go, with where its feet are. It's back below the windows, and stays there until placed. */
  onDropped?(point: SpritePoint): void;
}

export interface SpritePoint {
  display: number;
  x: number;
  y: number;
}

export interface Sprites extends Disposable {
  /**
   * Cuts a picture into frames, or throws when it can't be read or isn't a whole number of frames. Sheets stay in
   * memory until {@link Sprites.dispose}, so reuse one.
   */
  loadSheet(options: SpriteSheetOptions): SpriteSheet;
  add(options: SpriteOptions): Sprite;
  /**
   * Runs `step` before each frame, with the seconds since the last, until it returns false. For things moving right
   * now, not for anything that keeps going: nothing runs and nothing wakes once every step has stopped.
   */
  onFrame(step: (seconds: number) => boolean): Disposable;
  /** Shows the smooth sprites above the windows, such as while people arrange them, or back below. */
  lift(lifted: boolean): void;
}

export interface Sprite extends Disposable {
  /** Shows it there. Only what differs from the last call does anything, so keeping a resting sprite costs nothing. */
  place(place: SpritePlace): void;
  /** Says what screen readers call it, such as what it's doing. */
  describe(label: string): void;
  /** Its width and height on a display, in pixels. */
  sizeOn(display: number): number;
}

export interface LayerOptions {
  /** GLSL declarations the shader needs: uniforms, constants and functions. */
  declarations?: string;
  /**
   * GLSL statements run for every pixel. They can read `vec2 layer_position`, the pixel's place in pixels from the
   * display's top left corner, and `vec2 layer_size`, the display's size, and they set `vec4 layer_color` to the
   * pixel's colour with premultiplied alpha. It starts out transparent.
   */
  shader: string;
  /** Runs before every frame the layer draws, to set its uniforms. */
  frame(frame: LayerFrame): void;
  /** Whether the layer starts out active, as {@link Layer.active}. It does unless this is `false`. */
  active?: boolean;
  /**
   * `above-windows`, the default, draws over windows too, so it can reach them, and should leave their rectangles
   * clear. `below-windows` draws between the wallpaper and the windows.
   */
  depth?: 'above-windows' | 'below-windows';
  /**
   * The part of each display the layer covers, relative to its top left corner, such as a band along the bottom, or
   * `null` to leave the display out. The shader only runs there, which costs far less than the whole display. A list
   * of rectangles covers each of them on its own, such as the two sides, and {@link LayerDisplay.part} tells them
   * apart. It covers every display whole without this. Kestrel asks again when displays change and after
   * {@link Layer.reshape}.
   */
  area?(display: LayerArea): Rect | readonly Rect[] | null;
  /**
   * Names of picture atlases the shader samples, filled with {@link Layer.setPictures}. Each name declares
   * `sampler2D name`, `vec2 name_grid` (columns and rows of cells, each square), `float name_count` (how many pictures)
   * and `vec4 name_pictures[8]`: for each picture its first cell, how many frames it has, frames a second and its width
   * over its height. Cells count from the top left, row by row, and a picture's frames take the cells after its first.
   */
  atlases?: readonly string[];
}

export interface LayerArea {
  /** Which display this is, as Kestrel numbers them. */
  readonly index: number;
  readonly primary: boolean;
  readonly width: number;
  readonly height: number;
}

export interface LayerFrame {
  /** Seconds since the layer was added. It wraps around every hour, so shaders keep their precision. */
  readonly time: number;
  /** Seconds since the previous frame, or 0 for the first frame after the layer appears. */
  readonly elapsed: number;
  /** The displays the layer shows on in this frame, one entry for each rectangle of its {@link LayerOptions.area}. */
  readonly displays: readonly LayerDisplay[];
}

export interface LayerDisplay {
  /** Which display this is, as Kestrel numbers them. */
  readonly index: number;
  /** Which of the rectangles {@link LayerOptions.area} returned this entry draws, counting from 0. */
  readonly part: number;
  /** Whether it's the primary display. */
  readonly primary: boolean;
  readonly width: number;
  readonly height: number;
  /** Windows on this display, topmost first, relative to its top left corner. */
  readonly windows: readonly Outline[];
  /** The taskbar on this display, relative to its top left corner. */
  readonly taskbar: Rect | null;
  /** What shows of the taskbar, relative to the display's top left corner: the bar, or each island of a taskbar in islands. */
  readonly taskbarOutlines: readonly TaskbarOutline[];
  /** Sets a `float`, `vec2`, `vec3` or `vec4` uniform of this entry's rectangle, by how many values it gets. */
  uniform(name: string, ...values: number[]): void;
  /** Sets a uniform array, such as `vec4 rects[16]` with `components` 4. */
  uniformArray(name: string, components: 1 | 2 | 3 | 4, values: readonly number[]): void;
}

export interface Layer extends Disposable {
  /**
   * Whether the layer wants to draw. It only draws while it's active, the wallpaper shows on a display, animations
   * are on and the computer isn't saving power, fading in and out, and an inactive layer holds nothing on screen.
   */
  active: boolean;
  /** Asks {@link LayerOptions.area} again for every display, after what it depends on changed. */
  reshape(): void;
  /**
   * Fills one of the layer's {@link LayerOptions.atlases} with up to 8 pictures from the extension's folders, PNG,
   * WebP, SVG, GIF or JPEG, each scaled to fit 128 pixels. Animated GIF and WebP keep up to 16 frames, 64 in all.
   * Returns how many pictures it took.
   */
  setPictures(atlas: string, paths: readonly string[]): number;
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
  /**
   * Adds an element to the taskbar, drawn by Kestrel from views the extension gives. People decide where it goes: an
   * island of its own or part of another one, on any edge, so it can be laid out across or along the taskbar.
   */
  addElement(element: TaskbarElementOptions): TaskbarElement;
}

/** How an element is laid out where people put it. */
export interface ElementLayout {
  /** Whether the taskbar runs up and down a side of the display, so the element is laid out along it. */
  readonly vertical: boolean;
  /** How thick the taskbar is, in pixels: the element's height, or its width when vertical. */
  readonly thickness: number;
  /** The size of a taskbar button, in pixels, which pictures and controls should match. */
  readonly button: number;
}

export interface TaskbarElementOptions {
  /**
   * Names the element among the extension's elements, lowercase with dashes. Where people put it is kept by this
   * key, so keep it the same across versions.
   */
  key: string;
  /** What screen readers call it, and its name where people arrange the taskbar. */
  label: string;
  /** What it shows. Kestrel calls it again when the element moves to another edge or size, and after {@link TaskbarElement.refresh}. */
  content(layout: ElementLayout): View;
  /** What it grows to while the pointer is over it. It grows and shrinks smoothly. */
  expanded?(layout: ElementLayout): View;
  /** Whether it shows. A hidden element takes no room, and showing and hiding it is animated. It shows unless this is `false`. */
  shown?: boolean;
  /** Runs on a click on the element, outside its buttons and other controls. */
  onClick?(): void;
  /** Runs when it grows under the pointer and when it shrinks back, for what only needs updating while it's grown, such as a track's progress. */
  onExpandedChanged?(expanded: boolean): void;
  /** A menu that opens on a right click. */
  menu?: ActionItem[];
}

export interface TaskbarElement extends Disposable {
  update(changes: Partial<Omit<TaskbarElementOptions, 'key'>>): void;
  /** Asks for `content` and `expanded` again, when what they show has changed. */
  refresh(): void;
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

export interface Popups {
  /** Opens a panel or a small window that Kestrel draws from `content`, in Luft's style. */
  open(options: PopupOptions): Popup;
}

/** A point in pixels from the top left corner of all displays. */
export interface Point {
  x: number;
  y: number;
}

/** A place on the display the pointer is on, inside the area windows use. */
export type ScreenPosition = 'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';

/** Where a pop-up appears: next to one of the extension's taskbar items or elements, at the pointer, at a place on the display, or at a point. */
export type PopupAnchor = TaskbarItem | TaskbarElement | 'pointer' | ScreenPosition | Point;

export interface PopupOptions {
  anchor: PopupAnchor;
  /** What screen readers call it, and a window's title. */
  title: string;
  content: View;
  /**
   * A `panel`, the default, takes the keyboard while it's open and closes when people press Escape, click elsewhere
   * or open something else, like quick settings. A `window` floats above the windows without taking the keyboard
   * until people click into it, has a title and a close button, and stays until it's closed or people drag it away.
   */
  kind?: 'panel' | 'window';
  /** Width in pixels, 200 to 560; 340 without it. The height follows the content, up to what fits on the display. */
  width?: number;
  /** Runs once when it closes, however it closes. */
  onClosed?(): void;
}

export interface Popup extends Disposable {
  /** Whether it's still showing. Disposing it closes it. */
  readonly open: boolean;
  /** Shows new content. Parts that kept their place and kind are updated where they are, so sliders keep being dragged and fields keep their caret. */
  update(content: View): void;
}

/**
 * What a pop-up shows: a tree of Luft's own controls. `column` and `row` arrange their children; the rest are
 * controls. Callbacks run in the extension, and a callback that throws turns it off like any other.
 */
export type View =
  | StackView | TextView | IconView | ImageView | ButtonView | SwitchView | SliderView | EntryView | ItemView | ProgressView
  | { type: 'separator' } | { type: 'spacer' };

export interface StackView {
  type: 'column' | 'row';
  children: readonly View[];
  /** Pixels between children; 8 without it. */
  spacing?: number;
  /** How children line up across the stack: `fill`, the default for columns, stretches them. */
  align?: 'start' | 'center' | 'end' | 'fill';
}

export interface TextView {
  type: 'text';
  text: string;
  /** `body` without it. `number` keeps digits the same width, for clocks and counters. */
  style?: 'title' | 'body' | 'caption' | 'number';
  /** The widest it gets, in pixels. Longer text ends in an ellipsis, or with `marquee` slides along once when it changes and while the pointer is over it. */
  maxWidth?: number;
  marquee?: boolean;
}

export interface IconView {
  type: 'icon';
  icon: Icon;
  /** Pixels; 16 without it. */
  size?: number;
}

export interface ImageView {
  type: 'image';
  /** A PNG, JPEG, WebP or SVG in the extension's folder or data folder, or {@link MediaPlayer.artwork}. */
  path: string;
  width: number;
  height: number;
  /** Rounded corners, in pixels. */
  radius?: number;
  /** A thin ring around the picture, filled this far from 0 to 1, such as how far along a track is. */
  progress?: number;
}

export interface ButtonView {
  type: 'button';
  /** A label, an icon or both. Give an icon-only button a `label` anyway for screen readers, with `iconOnly`. */
  label?: string;
  icon?: Icon;
  iconOnly?: boolean;
  style?: 'default' | 'primary' | 'flat';
  /** A smaller button with a smaller icon, such as media controls under a title in the taskbar. */
  small?: boolean;
  disabled?: boolean;
  onActivate(): void;
}

export interface SwitchView {
  type: 'switch';
  label: string;
  checked: boolean;
  onToggled(checked: boolean): void;
}

export interface SliderView {
  type: 'slider';
  /** For screen readers. */
  label: string;
  /** 0 to 1. */
  value: number;
  onChanged(value: number): void;
}

export interface EntryView {
  type: 'entry';
  /** For screen readers, and shown while it's empty unless there's a `placeholder`. */
  label: string;
  placeholder?: string;
  /** What it starts with. Later updates leave what people typed alone unless this changes. */
  text?: string;
  onChanged?(text: string): void;
  /** Runs when people press Enter. */
  onSubmit?(text: string): void;
}

/** A row people can pick, like an entry in a list of results. */
export interface ItemView {
  type: 'item';
  title: string;
  subtitle?: string;
  icon?: Icon;
  /** A check mark at the end. */
  checked?: boolean;
  onActivate?(): void;
}

export interface ProgressView {
  type: 'progress';
  /** 0 to 1. */
  value: number;
}

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
  /**
   * Whether banners are held back right now: Do Not Disturb is on, or an extension such as Focus holds them. A
   * notification sent meanwhile goes straight to the notification center, so what should be seen when it's over can wait.
   */
  readonly heldBack: boolean;
  onHeldBackChanged(changed: () => void): Disposable;
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

export interface DoNotDisturb {
  /**
   * Holds back other notifications' banners and sounds until the hold ends, the way Do Not Disturb does, such as during
   * a work session. Urgent notifications and apps people let through Do Not Disturb still show. Nothing is lost: what
   * comes in stays in the notification center. Notifications the extension sends itself aren't held.
   */
  hold(): NotificationHold;
  /** Whether notifications are held back: Do Not Disturb is on, or an extension holds them. */
  readonly holding: boolean;
  onChanged(changed: () => void): Disposable;
}

/** Notifications that came in from one app during a hold, and are still in the notification center. */
export interface HeldNotifications {
  /** The app's name. */
  readonly app: string;
  readonly count: number;
}

export interface NotificationHold extends Disposable {
  /** What came in so far, by app, most first. Only names and counts: the extension never sees what notifications say. */
  readonly held: readonly HeldNotifications[];
  /** Runs `changed` when another notification is held, or a held one is dismissed. */
  onHeld(changed: () => void): Disposable;
  /**
   * Ends the hold and returns what came in, for the extension to sum up itself. Disposing the hold, or the extension
   * being turned off, ends it too, and then Kestrel sums up what came in with a notification of its own.
   */
  release(): readonly HeldNotifications[];
}

/**
 * Connects to the hosts the manifest names under `[network]`, over HTTPS. Requests to any other host are refused, so
 * the store and Settings can show exactly where an extension connects.
 */
export interface Network {
  fetch(url: string, options?: RequestOptions): Promise<Response>;
}

export interface RequestOptions {
  /** `GET` without it. */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Readonly<Record<string, string>>;
  /** Sent as is; set `content-type` in `headers`, such as `application/json`. */
  body?: string;
  /** Seconds to wait before giving up; 20 without it. */
  timeout?: number;
}

/** A whole response, up to 4 MB. A request that can't reach the host rejects instead. */
export interface Response {
  readonly status: number;
  /** Whether the status is 200 to 299. */
  readonly ok: boolean;
  /** Header names in lowercase. */
  readonly headers: Readonly<Record<string, string>>;
  readonly text: string;
  /** The body read as JSON. It throws when it isn't. */
  json<Value = unknown>(): Value;
}

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
  /** Runs `changed` when the computer has moved to another city, checked about every ten minutes. */
  onChanged(changed: (coordinates: Coordinates) => void): Disposable;
}

export type WeatherCondition = 'clear' | 'clouds' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm';

/** The season where the computer is, by the date and which side of the equator it's on. */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface WeatherReport {
  condition: WeatherCondition;
  /** Degrees Celsius. */
  temperature: number;
  /** Millimetres an hour. */
  precipitation: number;
  /** Kilometres an hour. */
  wind: number;
  daytime: boolean;
  /** Today's sunrise and sunset there, in milliseconds since 1970. */
  sunrise: number;
  sunset: number;
  season: Season;
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
  /** Stays the same while the player runs, to tell players apart. */
  readonly id: string;
  /** The app that plays, as its desktop file id when known. */
  readonly app: string | null;
  /** The player's name as people know it, such as the app's name. */
  readonly appName: string;
  readonly title: string;
  readonly artist: string;
  readonly album: string;
  /**
   * A picture of what plays, as a file Kestrel keeps that views can show by its path, or `null` while there's none or
   * it's still being fetched. {@link Media.onChanged} runs once it's there.
   */
  readonly artwork: string | null;
  readonly playing: boolean;
  /** The track's length in seconds, or 0 when the player doesn't say. */
  readonly length: number;
  readonly canGoNext: boolean;
  readonly canGoPrevious: boolean;
  readonly canSeek: boolean;
  /** Where the track is, in seconds. Players don't announce it as it moves, so ask while showing it. */
  position(): Promise<number>;
  /** Jumps to `seconds` into the track, when {@link canSeek}. */
  seek(seconds: number): void;
  playPause(): void;
  next(): void;
  previous(): void;
  /** Brings the player's window to the front. */
  raise(): void;
}

export interface Media {
  /** The player people would control with their media keys, if anything plays or paused. */
  readonly player: MediaPlayer | null;
  /** Every player there is, such as a music app and a browser tab. */
  readonly players: readonly MediaPlayer[];
  /** Where sound goes. */
  readonly output: AudioOutput;
  /** Runs `changed` when a player comes or goes, what it plays changes, it jumps within a track, or artwork arrives. */
  onChanged(changed: () => void): Disposable;
}

export interface AudioOutput {
  /** The volume of the sound output, 0 to 1. */
  volume: number;
  muted: boolean;
  /** Speakers, headphones and other outputs people can choose. */
  readonly devices: readonly OutputDevice[];
  /** Sends sound to the device with this {@link OutputDevice.id}. */
  choose(id: string): void;
  onChanged(changed: () => void): Disposable;
}

export interface OutputDevice {
  readonly id: string;
  readonly name: string;
  /** Where it is, such as the card it belongs to, or `null`. */
  readonly detail: string | null;
  readonly active: boolean;
}

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
  helper?: { path: string };
  /** The hosts {@link Network} may connect to, such as `api.example.com`, or `localhost:8787` while developing. */
  network?: { hosts: string[] };
}
