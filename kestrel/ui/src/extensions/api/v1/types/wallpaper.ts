import type { Disposable } from '../types.js';

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
  /** Where it sits among the other displays. */
  readonly x: number;
  readonly y: number;
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
   * Only for smooth sprites: the display it lives on, as in {@link SurfaceDisplay.index}, the main one without it. It
   * never shows beyond that display's edges, and {@link SpritePlace.display} doesn't move it.
   */
  display?: number;
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
