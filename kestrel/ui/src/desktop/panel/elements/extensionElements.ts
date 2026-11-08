import type St from 'gi://St';

import { Registry } from '../../../shared/registry.js';

/** How a taskbar lays out an element: across it, or along a side of the display. */
export interface ElementLayout {
  vertical: boolean;
  /** The taskbar's thickness in pixels. */
  thickness: number;
  /** The size of a taskbar button in pixels. */
  button: number;
  /** The size of the taskbar's own symbolic icons in pixels, such as the network and volume. */
  icon: number;
}

/** One taskbar's actor for an element. Its natural size follows what it shows, animating as it grows, shrinks, shows and hides. */
export interface ElementActor {
  readonly actor: St.Widget;
  /** The taskbar moved to another edge or changed size. */
  relayout(layout: ElementLayout): void;
  destroy(): void;
}

/**
 * Something an extension added to the taskbar that the taskbar's layout places, by `id`, wherever people put it: an
 * island of its own or part of another. Each taskbar that shows it asks for an actor of its own.
 */
export interface TaskbarElementEntry {
  /** `extension-id/key`, the same across restarts and versions, which arrangements are kept by. */
  readonly id: string;
  readonly label: string;
  create(layout: ElementLayout): ElementActor;
  watch(changed: () => void): () => void;
}

export const taskbarElements = new Registry<TaskbarElementEntry>();
