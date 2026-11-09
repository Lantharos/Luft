import type Clutter from 'gi://Clutter';

import { PopupFrame } from '../../extensions/api/v1/popups/frame.js';
import { atPosition, besideTaskbar, type Placement } from '../../extensions/api/v1/popups/placement.js';
import { heldBack } from '../../extensions/api/v1/notifications/notifications.js';
import type { View } from '../../extensions/api/v1/types.js';
import type { ExtensionHost } from '../../extensions/host.js';
import { playSound } from '../sounds/sounds.js';

export type { View };

export interface Popup {
  readonly open: boolean;
  update(content: View): void;
  dispose(): void;
}

export interface PopupOptions {
  /** A corner of the screen, or the taskbar button a panel opens from. */
  anchor: 'top-right' | 'center' | Clutter.Actor;
  kind: 'panel' | 'window';
  title: string;
  width: number;
  content: View;
  /** Plays the notification sound, unless notifications are held back. */
  chime?: boolean;
  onClosed?(): void;
}

const CONTROLS = { folders: [], extensionPath: '', act: (run: () => void) => run() };

function placement(host: ExtensionHost, anchor: PopupOptions['anchor']): Placement {
  const [pointerX, pointerY] = global.get_pointer();
  const pointerMonitor = host.monitorAt(pointerX, pointerY) ?? host.monitors()[host.primaryIndex()];
  if (typeof anchor === 'string') return atPosition(host, pointerMonitor, anchor);
  const [x, y] = anchor.get_transformed_position();
  const [width, height] = anchor.get_transformed_size();
  return besideTaskbar(host, host.monitorAt(x + width / 2, y + height / 2) ?? pointerMonitor, { x, y, width, height });
}

/** Post's windows and its panel, drawn the way extensions' pop-ups are so they look alike. */
export function openPopup(host: ExtensionHost, options: PopupOptions): Popup {
  let open = true;
  const frame = new PopupFrame(host, CONTROLS, options.content, {
    kind: options.kind,
    title: options.title,
    width: options.width,
    placement: placement(host, options.anchor),
    closed: () => {
      open = false;
      options.onClosed?.();
    },
  });
  frame.open();
  if (options.chime && !heldBack()) playSound('notification');
  return {
    get open() {
      return open;
    },
    update: content => {
      if (open) frame.update(content);
    },
    dispose: () => frame.close(),
  };
}
