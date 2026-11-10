import type { Disposable } from '../types.js';

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
 * are what earlier passes drew, `filter_size` is the display in pixels, `filter_scale` its display scale, for sizes that should look the same at any scale, and `filter_time` follows
 * {@link ScreenEffectOptions.animated}. It costs one pass over the display each time something changes on it, and none
 * while nothing does. One display takes one filter, so put everything into one shader: with two, the first waits until the
 * second is gone. They stay off on the lock screen.
 */
export interface DesktopFilterOptions extends ScreenEffectOptions {
  passes: readonly FilterPass[];
  /** Whether it moves or bends the picture. Over the whole screen, the pointer is then drawn into the picture too, or it would point at the wrong thing. */
  warps?: boolean;
  /** Whether screenshots and recordings show it. Like night light, they don't by default. */
  captured?: boolean;
  /**
   * Where it goes: over the `screen`, by default, or over the `desktop`, meaning the wallpaper and the taskbar, with what's
   * drawn on the wallpaper, while windows and everything else stay untouched and show it behind them where they let it through.
   * `filter_uv` still spans the display on both, so the two read as one picture.
   * Shaders that read earlier passes do it with `filter_read(cogl_samplerN, position)` to work in both places.
   */
  scope?: 'screen' | 'desktop';
  /** How far a desktop filter carries a pixel from where it was, as a share of the display, so what changes under it repaints that far around. */
  reach?: number;
  /**
   * For a desktop filter that bends the picture: where a point of the picture shows, both as shares of the display. Over the
   * desktop the pointer is then drawn there, so it stays on what it's over. Over windows, which don't bend, it stays as it is.
   */
  shownAt?: (x: number, y: number) => [number, number];
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
