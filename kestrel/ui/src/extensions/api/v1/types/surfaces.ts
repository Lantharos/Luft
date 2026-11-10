import type { Disposable } from '../types.js';

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
  /** The size of the taskbar's own symbolic icons, such as the network and volume, in pixels, which icons should match. */
  readonly icon: number;
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
  /**
   * Lets people drop files on the element, from Rover or any other app, and gets their full paths. The element lights
   * up while files are dragged over it.
   */
  onDrop?(paths: string[]): void;
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
  /**
   * Plays Luft's notification sound as it opens, for something waiting on people, such as a transfer to accept. It
   * stays quiet during Do Not Disturb and when people turned notification sounds off.
   */
  chime?: boolean;
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
  | SpinnerView | { type: 'separator' } | { type: 'spacer' };

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
  /** Pixels, kept from when it first shows; 16 without it. */
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

/**
 * Shows that something is going on whose end isn't known yet, such as looking for something. Use it on its own: not
 * next to a progress bar or a percentage, which already show the same.
 */
export interface SpinnerView {
  type: 'spinner';
  /** Pixels, kept from when it first shows; 16 without it. */
  size?: number;
}
