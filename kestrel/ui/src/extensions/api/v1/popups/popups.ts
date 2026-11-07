import { playSound } from '../../../../system/sounds/sounds.js';
import { heldBack } from '../notifications/notifications.js';
import { taskbarAnchors } from '../taskbar/taskbar.js';
import type { ApiContext } from '../context.js';
import type { Popup, PopupAnchor, PopupOptions, Popups, TaskbarElement, TaskbarItem } from '../types.js';
import { PopupFrame } from './frame.js';
import { atPoint, atPosition, besideTaskbar, type Placement } from './placement.js';

const DEFAULT_WIDTH = 340;
const MIN_WIDTH = 200;
const MAX_WIDTH = 560;

/** An extension's open panels, so they close when it types or opens another. */
export class OpenPanels {
  private readonly frames = new Set<PopupFrame>();

  add(frame: PopupFrame): () => void {
    this.frames.add(frame);
    return () => this.frames.delete(frame);
  }

  closeAll(): void {
    for (const frame of [...this.frames]) frame.close();
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
  const { host, scope, path, dataPath, panels } = context;
  const controls = { folders: [path, dataPath], extensionPath: path, act: (run: () => void) => context.fromPerson(run)() };
  return {
    open: (options: PopupOptions): Popup => {
      const kind = options.kind ?? 'panel';
      if (kind === 'panel') panels.closeAll();
      let open = true;
      let forgetPanel = () => {};
      const onClosed = options.onClosed && scope.guard(options.onClosed);
      const frame = new PopupFrame(host, controls, options.content, {
        kind,
        title: options.title,
        width: Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, options.width ?? DEFAULT_WIDTH))),
        placement: placementFor(context, options.anchor),
        closed: () => {
          open = false;
          forgetPanel();
          handle.dispose();
          onClosed?.();
        },
      });
      const handle = scope.disposable(() => frame.close());
      if (kind === 'panel') forgetPanel = panels.add(frame);
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
