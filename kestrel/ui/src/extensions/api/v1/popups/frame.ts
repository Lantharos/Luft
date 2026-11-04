import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { blurSurface } from '../../../../shared/layout/surface.js';
import { toward } from '../../../../shared/layout/edge.js';
import { animateActor } from '../../../../shared/motion/motion.js';
import { t } from '../../../../shared/i18n/index.js';
import type { ExtensionHost } from '../../../host.js';
import type { View } from '../types.js';
import type { ControlHost } from './controls.js';
import type { Placement } from './placement.js';
import { RenderedView } from './render.js';

const RISE = 6;
const OPEN = { duration: 150, mode: Clutter.AnimationMode.EASE_OUT_QUAD };
const CLOSE = { duration: 100, mode: Clutter.AnimationMode.EASE_IN_QUAD };

export interface FrameOptions {
  kind: 'panel' | 'window';
  title: string;
  width: number;
  placement: Placement;
  closed(): void;
}

/** A pop-up on screen: the glass around an extension's view, how it opens and closes, and for panels the keyboard. */
export class PopupFrame {
  readonly actor: St.BoxLayout;
  private readonly shield: St.Widget | null;
  private readonly view: RenderedView;
  private readonly scroll: St.ScrollView;
  private readonly signals: [Clutter.Actor, number][] = [];
  private previousFocus: Clutter.Actor | null = null;
  private drag: { grab: Clutter.Grab; dx: number; dy: number } | null = null;
  private closing = false;
  private updating = false;

  constructor(private readonly host: ExtensionHost, controls: ControlHost, content: View, private readonly options: FrameOptions) {
    const panel = options.kind === 'panel';
    this.actor = new St.BoxLayout({
      name: 'kestrel-extension-popup', style_class: `kestrel-extension-popup ${options.kind}`, orientation: Clutter.Orientation.VERTICAL,
      reactive: true, accessible_name: options.title, width: options.width,
    });
    blurSurface(this.actor, 18);
    if (!panel) this.actor.add_child(this.header());
    this.view = new RenderedView(controls);
    this.scroll = new St.ScrollView({ hscrollbar_policy: St.PolicyType.NEVER, vscrollbar_policy: St.PolicyType.AUTOMATIC, child: this.view.actor });
    this.actor.add_child(this.scroll);
    this.view.show(content);
    this.shield = panel ? this.makeShield() : null;
    this.actor.connect('key-press-event', (_actor, event) => this.key(event));
  }

  private makeShield(): St.Widget {
    const shield = new St.Widget({ reactive: true, x: 0, y: 0, width: global.stage.width, height: global.stage.height });
    shield.connect('button-press-event', () => {
      this.close();
      return Clutter.EVENT_STOP;
    });
    shield.connect('touch-event', (_shield, event) => {
      if (event.type() === Clutter.EventType.TOUCH_BEGIN) this.close();
      return Clutter.EVENT_STOP;
    });
    return shield;
  }

  private header(): St.BoxLayout {
    const header = new St.BoxLayout({ style_class: 'kestrel-extension-popup-header' });
    const title = new St.Label({
      style_class: 'kestrel-extension-popup-title', text: this.options.title, reactive: true, x_expand: true, y_align: Clutter.ActorAlign.CENTER,
    });
    title.connect('button-press-event', (_title, event) => this.startDrag(title, event));
    title.connect('motion-event', (_title, event) => this.moveDrag(event));
    title.connect('button-release-event', () => this.endDrag());
    header.add_child(title);
    const close = new St.Button({
      style_class: 'button kestrel-extension-button flat icon-only', can_focus: true, accessible_name: t('extension-popup-close'),
      child: new St.Icon({ icon_name: 'window-close-symbolic', icon_size: 16 }),
    });
    close.connect('clicked', () => this.close());
    header.add_child(close);
    return header;
  }

  private startDrag(handle: Clutter.Actor, event: Clutter.Event): boolean {
    if (event.get_button() !== Clutter.BUTTON_PRIMARY) return Clutter.EVENT_PROPAGATE;
    const [x, y] = event.get_coords();
    this.drag = { grab: global.stage.grab(handle), dx: x - this.actor.x, dy: y - this.actor.y };
    return Clutter.EVENT_STOP;
  }

  private moveDrag(event: Clutter.Event): boolean {
    if (!this.drag) return Clutter.EVENT_PROPAGATE;
    const [x, y] = event.get_coords();
    const stage = global.stage;
    this.actor.set_position(
      Math.round(Math.max(0, Math.min(x - this.drag.dx, stage.width - this.actor.width))),
      Math.round(Math.max(0, Math.min(y - this.drag.dy, stage.height - this.actor.height))),
    );
    return Clutter.EVENT_STOP;
  }

  private endDrag(): boolean {
    this.drag?.grab.dismiss();
    this.drag = null;
    return Clutter.EVENT_STOP;
  }

  private key(event: Clutter.Event): boolean {
    const key = event.get_key_symbol();
    if (key === Clutter.KEY_Escape) {
      this.close();
      return Clutter.EVENT_STOP;
    }
    if (key === Clutter.KEY_Tab || key === Clutter.KEY_ISO_Left_Tab) {
      const backward = key === Clutter.KEY_ISO_Left_Tab || !!(event.get_state() & Clutter.ModifierType.SHIFT_MASK);
      this.actor.navigate_focus(global.stage.get_key_focus(), backward ? St.DirectionType.TAB_BACKWARD : St.DirectionType.TAB_FORWARD, true);
      return Clutter.EVENT_STOP;
    }
    return Clutter.EVENT_PROPAGATE;
  }

  open(): void {
    const panel = this.options.kind === 'panel';
    if (panel) this.host.dismissSurfaces();
    if (this.shield) this.host.addPopup(this.shield);
    this.host.addPopup(this.actor);
    this.fit();
    const { edge } = this.options.placement;
    this.actor.opacity = 0;
    this.actor.set(toward(edge, RISE));
    animateActor(this.actor, { opacity: 255, translation_x: 0, translation_y: 0, ...OPEN });
    if (!panel) return;
    this.previousFocus = global.stage.get_key_focus();
    if (!this.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false)) this.actor.grab_key_focus();
    this.watch(global.stage, global.stage.connect('notify::key-focus', () => {
      const focus = global.stage.get_key_focus();
      if (!this.closing && !this.updating && (!focus || !this.actor.contains(focus))) this.close();
    }));
  }

  private watch(actor: Clutter.Actor, id: number): void {
    this.signals.push([actor, id]);
  }

  /** Sizes the pop-up to its content, up to what fits on its display, and places it. */
  private fit(): void {
    const { placement, width } = this.options;
    const theme = this.actor.get_theme_node();
    const header = this.options.kind === 'window' ? this.actor.get_first_child() : null;
    const chrome = theme.get_vertical_padding() + (header?.get_preferred_height(width)[1] ?? 0);
    const content = this.view.actor.get_preferred_height(width - theme.get_horizontal_padding())[1];
    const height = Math.min(content + chrome, placement.area.height - 24);
    this.scroll.height = height - chrome;
    const { x, y } = placement.place(width, height);
    this.actor.set_position(x, y);
  }

  /** Shows new content. A panel keeps the keyboard when the control that had it goes away, such as a button replaced by others. */
  update(content: View): void {
    this.updating = true;
    this.view.show(content);
    this.updating = false;
    if (this.options.kind !== 'panel') return;
    this.fit();
    const focus = global.stage.get_key_focus();
    if (!this.closing && (!focus || !this.actor.contains(focus)) && !this.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false))
      this.actor.grab_key_focus();
  }

  close(): void {
    if (this.closing) return;
    this.closing = true;
    for (const [actor, id] of this.signals.splice(0)) actor.disconnect(id);
    this.endDrag();
    if (this.shield) {
      this.host.removePopup(this.shield);
      this.shield.destroy();
    }
    const focus = global.stage.get_key_focus();
    if (focus && this.actor.contains(focus)) {
      if (this.previousFocus?.mapped) this.previousFocus.grab_key_focus();
      else global.stage.set_key_focus(null);
    }
    this.options.closed();
    this.actor.reactive = false;
    animateActor(this.actor, {
      opacity: 0, ...toward(this.options.placement.edge, RISE), ...CLOSE,
      onStopped: () => {
        this.host.removePopup(this.actor);
        this.actor.destroy();
      },
    });
  }
}
