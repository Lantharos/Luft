import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { animateActor } from '../shared/motion.js';

const PEEK_DELAY = 450;
const PEEK_DURATION = 180;
const PEEKED_TYPES = [Meta.WindowType.NORMAL, Meta.WindowType.DIALOG, Meta.WindowType.MODAL_DIALOG, Meta.WindowType.UTILITY];

let hidden: Meta.Window[] = [];

function desktopWindows(): [Meta.WindowActor, Meta.Window][] {
  const shell = global as unknown as Shell.Global;
  const workspace = shell.workspace_manager.get_active_workspace();
  return shell.get_window_actors()
    .map(actor => [actor, actor.meta_window] as [Meta.WindowActor, Meta.Window | null])
    .filter((pair): pair is [Meta.WindowActor, Meta.Window] => !!pair[1] &&
      PEEKED_TYPES.includes(pair[1].window_type) && pair[1].located_on_workspace(workspace));
}

export class DesktopPeek {
  readonly actor = new St.Button({ style_class: 'kestrel-peek', track_hover: true, reactive: true, accessible_name: 'Show desktop', y_expand: true });
  private timer = 0;
  private peeking = false;

  constructor() {
    this.actor.connect('notify::hover', () => {
      this.cancel();
      if (this.actor.hover) this.timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, PEEK_DELAY, () => {
        this.timer = 0;
        this.peek(true);
        return GLib.SOURCE_REMOVE;
      });
      else this.peek(false);
    });
    this.actor.connect('clicked', () => {
      this.cancel();
      this.peek(false, true);
      this.toggleDesktop();
    });
    this.actor.connect('destroy', () => this.cancel());
  }

  private cancel(): void {
    if (this.timer) GLib.Source.remove(this.timer);
    this.timer = 0;
  }

  private peek(peeking: boolean, immediate = false): void {
    if (peeking === this.peeking) return;
    this.peeking = peeking;
    for (const [actor] of desktopWindows())
      animateActor(actor, { opacity: peeking ? 0 : 255, duration: immediate ? 0 : PEEK_DURATION, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
  }

  toggleDesktop(): void {
    const shell = global as unknown as Shell.Global;
    const shown = desktopWindows().map(([, window]) => window).filter(window => !window.minimized && window.window_type === Meta.WindowType.NORMAL);
    if (shown.length) {
      hidden = shown;
      for (const window of shown) window.minimize();
      return;
    }
    const restore = hidden.filter(window => window.get_compositor_private());
    hidden = [];
    for (const window of restore) window.unminimize();
    restore.at(-1)?.activate(shell.get_current_time());
  }
}
