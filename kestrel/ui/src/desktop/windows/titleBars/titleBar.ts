import Clutter from 'gi://Clutter';
import Graphene from 'gi://Graphene';
import Meta from 'gi://Meta';
import Pango from 'gi://Pango';
import St from 'gi://St';

import { animateActor, Duration } from '../../../shared/motion.js';
import { localized, t } from '../../../shared/i18n/index.js';
import { ResizeArea } from './resizeArea.js';

export type ShowWindowMenu = (window: Meta.Window, x: number, y: number) => void;

interface Press {
  x: number;
  y: number;
  time: number;
}

const WINDOW_SIGNALS = ['size-changed', 'notify::titlebar-height', 'notify::appears-focused', 'notify::title',
  'notify::maximized-horizontally', 'notify::maximized-vertically', 'notify::resizeable'] as const;
const PRESSED_SCALE = 0.96;

const settings = () => global.stage.get_context().get_settings();

function windowButton(name: string, labelId: string, activate: () => void): St.Button {
  const icon = new St.Icon({ icon_name: `titlebar-${name}-symbolic`, style_class: 'kestrel-titlebar-icon' });
  const button = new St.Button({ style_class: `kestrel-titlebar-button kestrel-titlebar-${name}`,
    child: icon, y_align: Clutter.ActorAlign.CENTER });
  localized(button, () => (button.accessible_name = t(labelId)));
  button.set_pivot_point(0.5, 0.5);
  button.connect('notify::pressed', () => animateActor(button, {
    scale_x: button.pressed ? PRESSED_SCALE : 1,
    scale_y: button.pressed ? PRESSED_SCALE : 1,
    duration: Duration.tap,
    mode: Clutter.AnimationMode.EASE_OUT_QUAD,
  }));
  button.connect('clicked', activate);
  return button;
}

export class TitleBar {
  private readonly resizeArea: ResizeArea;
  private readonly shadow = new St.Widget({ style_class: 'kestrel-titlebar-shadow' });
  private readonly bar = new St.BoxLayout({ style_class: 'kestrel-titlebar', reactive: true });
  private readonly title = new St.Label({ style_class: 'kestrel-titlebar-title', x_expand: true, y_align: Clutter.ActorAlign.CENTER });
  private readonly minimize: St.Button;
  private readonly maximize: St.Button;
  private readonly close: St.Button;
  private readonly signals: number[];
  private readonly actorSignal: number;
  private press: Press | null = null;
  private lastPress: Press | null = null;

  constructor(private readonly window: Meta.Window, private readonly actor: Meta.WindowActor,
    private readonly showMenu: ShowWindowMenu, gone: () => void) {
    this.resizeArea = new ResizeArea(window);
    this.minimize = windowButton('minimize', 'title-bar-minimize', () => window.minimize());
    this.maximize = windowButton('maximize', 'title-bar-maximize', () => this.toggleMaximized());
    this.close = windowButton('close', 'title-bar-close', () => window.delete(global.get_current_time()));
    const buttons = new St.BoxLayout({ style_class: 'kestrel-titlebar-buttons' });
    for (const button of [this.minimize, this.maximize, this.close]) buttons.add_child(button);
    this.bar.add_child(this.title);
    this.bar.add_child(buttons);
    this.title.clutter_text.ellipsize = Pango.EllipsizeMode.END;

    for (const child of [this.bar, this.shadow, this.resizeArea.actor]) actor.insert_child_below(child, null);
    this.actorSignal = actor.connect('destroy', () => {
      this.disconnect();
      gone();
    });

    this.bar.connect('button-press-event', (_bar, event: Clutter.Event) => this.pressed(event));
    this.bar.connect('motion-event', (_bar, event: Clutter.Event) => this.moved(event));
    this.bar.connect('button-release-event', () => {
      this.press = null;
      return Clutter.EVENT_PROPAGATE;
    });
    this.signals = WINDOW_SIGNALS.map(signal => window.connect(signal, () => this.update()));
    this.update();
  }

  private toggleMaximized(): void {
    if (this.window.is_maximized()) this.window.unmaximize();
    else this.window.maximize();
  }

  private isDoubleClick(press: Press): boolean {
    const last = this.lastPress;
    const { double_click_time: time, double_click_distance: distance } = settings();
    return !!last && press.time - last.time <= time && Math.hypot(press.x - last.x, press.y - last.y) <= distance;
  }

  private onBar(event: Clutter.Event): boolean {
    const target = global.stage.get_event_actor(event);
    return target === this.bar || target === this.title;
  }

  private pressed(event: Clutter.Event): boolean {
    if (!this.onBar(event)) return Clutter.EVENT_PROPAGATE;
    const [x, y] = event.get_coords();
    const press = { x, y, time: event.get_time() };
    switch (event.get_button()) {
      case Clutter.BUTTON_PRIMARY:
        if (this.isDoubleClick(press)) {
          this.lastPress = null;
          this.press = null;
          if (this.window.can_maximize()) this.toggleMaximized();
        } else {
          this.lastPress = press;
          this.press = press;
        }
        return Clutter.EVENT_STOP;
      case Clutter.BUTTON_SECONDARY:
        this.showMenu(this.window, x, y);
        return Clutter.EVENT_STOP;
      default:
        return Clutter.EVENT_PROPAGATE;
    }
  }

  private moved(event: Clutter.Event): boolean {
    const press = this.press;
    if (!press) return Clutter.EVENT_PROPAGATE;
    const [x, y] = event.get_coords();
    if (Math.hypot(x - press.x, y - press.y) < settings().dnd_drag_threshold) return Clutter.EVENT_STOP;
    this.press = null;
    this.lastPress = null;
    const stage = global.stage;
    const sprite = stage.get_context().get_backend().get_sprite(stage, event);
    this.window.begin_grab_op(Meta.GrabOp.MOVING, sprite, event.get_time(), new Graphene.Point({ x: press.x, y: press.y }));
    return Clutter.EVENT_STOP;
  }

  private update(): void {
    const height = this.window.get_titlebar_height();
    const frame = this.window.get_frame_rect();
    const buffer = this.window.get_buffer_rect();
    const x = frame.x - buffer.x;
    const y = frame.y - buffer.y;
    this.resizeArea.place(x, y, frame.width, frame.height);
    this.shadow.set_position(x, y);
    this.shadow.set_size(frame.width, frame.height);
    this.bar.set_position(x, y);
    this.bar.set_size(frame.width, height);

    const square = !this.window.has_rounded_corners();
    const focused = this.window.appears_focused;
    for (const widget of [this.shadow, this.bar]) {
      if (square) widget.add_style_class_name('kestrel-titlebar-square');
      else widget.remove_style_class_name('kestrel-titlebar-square');
      if (focused) widget.remove_style_pseudo_class('backdrop');
      else widget.add_style_pseudo_class('backdrop');
    }
    this.title.text = this.window.title ?? '';
    this.minimize.visible = this.window.can_minimize();
    this.maximize.visible = this.window.can_maximize();
    this.close.visible = this.window.can_close();
  }

  private disconnect(): void {
    for (const id of this.signals) this.window.disconnect(id);
    this.actor.disconnect(this.actorSignal);
  }

  destroy(): void {
    this.disconnect();
    this.resizeArea.actor.destroy();
    this.shadow.destroy();
    this.bar.destroy();
  }
}
