import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import St from 'gi://St';

import { clamp } from '../../math.js';

function switchIcon(iconName: string): St.Icon {
  return new St.Icon({
    icon_name: iconName,
    x_expand: true,
    x_align: Clutter.ActorAlign.CENTER,
    y_align: Clutter.ActorAlign.CENTER,
  });
}

export class Switch extends St.Widget {
  static [GObject.properties] = {
    'state': GObject.ParamSpec.boolean('state', null, null, GObject.ParamFlags.READWRITE, false),
  };

  static {
    GObject.registerClass(this);
  }

  private stateValue = false;
  private readonly onIcon = switchIcon('switch-on-symbolic');
  private readonly offIcon = switchIcon('switch-off-symbolic');
  private readonly handle: St.Widget;
  private readonly handleAlignConstraint: Clutter.AlignConstraint;
  private readonly panGesture = new Clutter.PanGesture();
  private readonly a11ySettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.a11y.interface' });
  private grab: Clutter.Grab | null = null;
  private initialGrabX = 0;

  constructor(state: boolean) {
    super({
      style_class: 'toggle-switch',
      accessible_role: Atk.Role.CHECK_BOX,
      y_align: Clutter.ActorAlign.CENTER,
      track_hover: true,
      reactive: true,
    });

    const box = new St.BoxLayout({
      x_expand: true,
      y_expand: true,
      constraints: new Clutter.BindConstraint({ source: this, coordinate: Clutter.BindCoordinate.SIZE }),
    });
    this.add_child(box);
    box.add_child(this.onIcon);
    box.add_child(this.offIcon);

    this.handle = new St.Widget({
      style_class: 'handle',
      y_align: Clutter.ActorAlign.CENTER,
      constraints: new Clutter.BindConstraint({ source: this, coordinate: Clutter.BindCoordinate.HEIGHT }),
    });
    this.bind_property('reactive', this.handle, 'reactive', GObject.BindingFlags.SYNC_CREATE);

    this.handleAlignConstraint = new Clutter.AlignConstraint({
      name: 'align',
      align_axis: Clutter.AlignAxis.X_AXIS,
      source: this,
    });
    this.handle.add_constraint(this.handleAlignConstraint);
    this.add_child(this.handle);

    this.panGesture.set_begin_threshold(0);
    this.panGesture.connect('recognize', () => this.startDragging());
    this.panGesture.connect('pan-update', () => this.dragUpdate());
    this.panGesture.connect('end', () => this.endDragging());
    this.handle.add_action(this.panGesture);

    this.state = state;

    this.a11ySettings.connectObject('changed::show-status-shapes', () => this.updateIconOpacity(), this);
    this.updateIconOpacity();
  }

  private updateIconOpacity(): void {
    const activeOpacity = this.a11ySettings.get_boolean('show-status-shapes') ? 255 : 0;
    this.onIcon.opacity = activeOpacity;
    this.offIcon.opacity = activeOpacity;
  }

  get state(): boolean {
    return this.stateValue;
  }

  set state(state: boolean) {
    const duration = this.handle.mapped ? this.handle.get_theme_node().get_transition_duration() : 0;

    if (state) this.add_style_pseudo_class('checked');
    else this.remove_style_pseudo_class('checked');

    this.handle.ease_property('@constraints.align.factor', state ? 1.0 : 0.0, { duration });

    if (this.stateValue !== state) {
      this.stateValue = state;
      this.notify('state');
    }
  }

  toggle(): void {
    this.state = !this.state;
  }

  private startDragging(): void {
    this.initialGrabX = this.panGesture.get_centroid_abs().x;
    this.grab = global.stage.grab(this);
  }

  private endDragging(): void {
    this.grab?.dismiss();
    this.grab = null;

    if (this.panGesture.get_accumulated_delta().get_x() > 0) this.state = this.handleAlignConstraint.get_factor() > 0.5;
    else this.toggle();
  }

  private dragUpdate(): void {
    const absX = this.panGesture.get_centroid_abs().x;
    const factorDiff = (absX - this.initialGrabX) / (this.get_width() - this.handle.get_width());
    const factor = factorDiff + (this.state ? 1.0 : 0.0);

    this.handleAlignConstraint.set_factor(clamp(factor, 0, 1));
  }
}
