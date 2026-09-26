import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import * as DND from 'resource:///org/gnome/shell/ui/dnd.js';

import type { Rect } from './grid.js';

export const CARD_HEADER = 30;

interface WindowIconApp extends Shell.App {
  create_window_icon_texture(window: Meta.Window, size: number): Clutter.Actor;
}

export interface WindowDragSource { window: Meta.Window; }

export class WindowCard {
  readonly actor: St.Button;
  private readonly preview = new St.Widget({ style_class: 'kestrel-task-preview', clip_to_allocation: true });
  private readonly title: St.Label;
  private readonly clone: Clutter.Clone | null = null;
  private readonly signals: number[] = [];

  constructor(readonly window: Meta.Window, activate: () => void, changed: () => void) {
    const app = Shell.WindowTracker.get_default().get_window_app(window) as WindowIconApp | null;
    const header = new St.BoxLayout({ style_class: 'kestrel-task-header', height: CARD_HEADER });
    const icon = app ? app.create_window_icon_texture(window, 16) : new St.Icon({ icon_name: 'application-x-executable-symbolic', icon_size: 16 });
    icon.y_align = Clutter.ActorAlign.CENTER;
    header.add_child(icon);
    this.title = new St.Label({ style_class: 'kestrel-task-title', x_expand: true, y_align: Clutter.ActorAlign.CENTER });
    header.add_child(this.title);
    const close = new St.Button({ style_class: 'kestrel-task-close', opacity: 0, accessible_name: 'Close window',
      child: new St.Icon({ icon_name: 'window-close-symbolic', icon_size: 14 }) });
    close.connect('clicked', () => window.delete((global as unknown as Shell.Global).get_current_time()));
    header.add_child(close);

    const body = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
    body.add_child(header);
    body.add_child(this.preview);
    this.actor = new St.Button({ style_class: 'kestrel-task-window', child: body, can_focus: true, track_hover: true,
      button_mask: St.ButtonMask.PRIMARY | St.ButtonMask.MIDDLE });
    this.actor.connect('clicked', (_actor, button: number) => {
      if (button === Clutter.BUTTON_MIDDLE) window.delete((global as unknown as Shell.Global).get_current_time());
      else activate();
    });
    const revealClose = () => { close.opacity = this.actor.hover || this.actor.has_key_focus() ? 255 : 0; };
    this.actor.connect('notify::hover', revealClose);
    this.actor.connect('key-focus-in', revealClose);
    this.actor.connect('key-focus-out', revealClose);
    this.actor.connect('key-press-event', (_actor, event: Clutter.Event) => {
      if (event.get_key_symbol() !== Clutter.KEY_Delete) return Clutter.EVENT_PROPAGATE;
      window.delete((global as unknown as Shell.Global).get_current_time());
      return Clutter.EVENT_STOP;
    });

    const source = window.get_compositor_private() as Meta.WindowActor | null;
    if (source) {
      this.clone = new Clutter.Clone({ source });
      this.preview.add_child(this.clone);
    }
    const updateTitle = () => {
      this.title.text = window.title || app?.get_name() || '';
      this.actor.accessible_name = this.title.text;
    };
    updateTitle();
    this.signals.push(window.connect('notify::title', updateTitle), window.connect('unmanaged', changed), window.connect('workspace-changed', changed));

    (this.actor as St.Button & { _delegate: object })._delegate = {
      window,
      getDragActor: () => new Clutter.Clone({ source: this.preview, width: this.preview.width, height: this.preview.height }),
      getDragActorSource: () => this.preview,
    };
    const draggable = DND.makeDraggable(this.actor, { dragActorMaxSize: 180, dragActorOpacity: 230 });
    draggable.connect('drag-begin', () => { this.actor.opacity = 90; });
    draggable.connect('drag-end', () => { this.actor.opacity = 255; });
  }

  place({ x, y, width, height }: Rect): void {
    this.actor.set_position(x, y);
    this.actor.set_size(width, height);
    const previewHeight = height - CARD_HEADER;
    this.preview.set_size(width, previewHeight);
    if (!this.clone) return;
    const frame = this.window.get_frame_rect();
    const buffer = this.window.get_buffer_rect();
    const scale = width / frame.width;
    this.clone.set_position(Math.round((buffer.x - frame.x) * scale), Math.round((buffer.y - frame.y) * scale));
    this.clone.set_size(Math.round(buffer.width * scale), Math.round(buffer.height * scale));
  }

  destroy(): void {
    for (const id of this.signals) this.window.disconnect(id);
    this.actor.destroy();
  }
}
