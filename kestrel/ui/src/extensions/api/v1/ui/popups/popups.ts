import { playSound } from '../../../../../system/sound/sounds/sounds.js';
import { heldBack } from '../notifications/notifications.js';
import { taskbarAnchors } from '../taskbar/taskbar.js';
import type { ApiContext } from '../../core/context.js';
import type { Popup, PopupAnchor, PopupOptions, Popups, TaskbarElement, TaskbarItem } from '../../types.js';
import { PopupFrame } from './frame.js';
import { atPoint, atPosition, besideTaskbar, type Placement } from './placement.js';

const DEFAULT_WIDTH = 340;
const MIN_WIDTH = 200;
const MAX_WIDTH = 560;

export class OpenPopups {
  private readonly panels = new Set<PopupFrame>();
  private readonly windows = new Set<PopupFrame>();

  add(frame: PopupFrame, kind: 'panel' | 'window'): () => void {
    const frames = kind === 'panel' ? this.panels : this.windows;
    frames.add(frame);
    return () => frames.delete(frame);
  }

  closePanels(): void {
    for (const frame of [...this.panels]) frame.close();
  }

  hideAll(): void {
    for (const frame of [...this.panels, ...this.windows]) frame.close(false);
  }
}

function placementFor(context: ApiContext, anchor: PopupAnchor): Placement {
  const { host } = context;
  const [pointerX, pointerY] = global.get_pointer();
  const pointerMonitor = host.monitorAt(pointerX, pointerY) ?? host.monitors()[host.primaryIndex()];
  if (anchor === 'pointer') return atPoint(host, pointerMonitor, { x: pointerX, y: pointerY });
  if (typeof anchor === 'string') return atPosition(host, pointerMonitor, anchor);
  const anchored = anchor as TaskbarItem | TaskbarElement;
  const button = taskbarAnchors.get(anchored)?.();
  if (button?.mapped) {
    const [x, y] = button.get_transformed_position();
    const [width, height] = button.get_transformed_size();
    return besideTaskbar(host, host.monitorAt(x + width / 2, y + height / 2) ?? pointerMonitor, { x, y, width, height });
  }
  if (taskbarAnchors.has(anchored)) return atPoint(host, pointerMonitor, { x: pointerX, y: pointerY });
  const { x, y } = anchor as { x: number; y: number };
  return atPoint(host, host.monitorAt(x, y) ?? pointerMonitor, { x, y });
}

export function popupsApi(context: ApiContext): Popups {
  const { host, scope, path, dataPath, popups } = context;
  const controls = { folders: [path, dataPath], extensionPath: path, act: (run: () => void) => context.fromPerson(run)() };
  const usable = () => host.desktop.active && !host.desktop.locked;
  scope.disposable(host.desktop.watch(() => {
    if (!usable()) popups.hideAll();
  }));
  return {
    open: (options: PopupOptions): Popup => {
      const kind = options.kind ?? 'panel';
      const onClosed = options.onClosed && scope.guard(options.onClosed);
      if (!usable()) {
        onClosed?.();
        return { open: false, update: () => {}, dispose: () => {} };
      }
      if (kind === 'panel') popups.closePanels();
      let open = true;
      let forget = () => {};
      const frame = new PopupFrame(host, controls, options.content, {
        kind,
        title: options.title,
        width: Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, options.width ?? DEFAULT_WIDTH))),
        placement: placementFor(context, options.anchor),
        closed: () => {
          open = false;
          forget();
          handle.dispose();
          onClosed?.();
        },
      });
      const handle = scope.disposable(() => frame.close());
      forget = popups.add(frame, kind);
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
    },
  };
}
