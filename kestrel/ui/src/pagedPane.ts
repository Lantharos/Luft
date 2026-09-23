import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';

export class PagedPane {
  readonly actor = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
  readonly body = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
  private readonly viewport = new St.Widget({ clip_to_allocation: true, x_expand: true });
  private readonly navigation = new St.BoxLayout({ style_class: 'kestrel-page-navigation', visible: false });
  private readonly label = new St.Label({ x_expand: true, x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER });
  private readonly previous: St.Button;
  private readonly next: St.Button;
  private offset = 0;
  private maximum = 0;

  constructor() {
    this.body.add_constraint(new Clutter.BindConstraint({ source: this.viewport, coordinate: Clutter.BindCoordinate.WIDTH }));
    this.viewport.add_child(this.body);
    this.actor.add_child(this.viewport);
    this.previous = this.button('go-up-symbolic', 'Previous page', -1);
    this.next = this.button('go-down-symbolic', 'Next page', 1);
    this.navigation.add_child(this.previous);
    this.navigation.add_child(this.label);
    this.navigation.add_child(this.next);
    this.actor.add_child(this.navigation);
    const stage = (global as unknown as Shell.Global).stage;
    const focusSignal = stage.connect('notify::key-focus', () => {
      const focus = stage.get_key_focus();
      if (!focus || !this.body.contains(focus) || !this.maximum) return;
      const [, y] = focus.get_transformed_position();
      const [, top] = this.viewport.get_transformed_position();
      if (y < top) this.move(y - top);
      else if (y + focus.height > top + this.viewport.height)
        this.move(y + focus.height - top - this.viewport.height);
    });
    this.actor.connect('destroy', () => stage.disconnect(focusSignal));
  }

  measure(width: number, limit: number): number {
    this.body.width = width;
    const natural = this.body.get_preferred_height(width)[1];
    this.navigation.visible = natural > limit;
    const footer = this.navigation.visible ? 40 : 0;
    this.viewport.height = Math.min(natural, Math.max(40, limit - footer));
    this.maximum = Math.max(0, natural - this.viewport.height);
    this.move(0);
    return this.viewport.height + footer;
  }

  reset(): void {
    this.offset = 0;
    this.body.translation_y = 0;
  }

  private button(icon: string, label: string, direction: number): St.Button {
    const button = new St.Button({
      style_class: 'kestrel-icon-button', width: 40, height: 40,
      can_focus: true, track_hover: true, accessible_name: label,
      child: new St.Icon({ icon_name: icon, icon_size: 16 }),
    });
    button.connect('clicked', () => this.move(direction * Math.max(1, this.viewport.height - 40)));
    return button;
  }

  private move(distance: number): void {
    this.offset = Math.max(0, Math.min(this.maximum, this.offset + distance));
    this.body.translation_y = -this.offset;
    this.previous.reactive = this.previous.can_focus = this.offset > 0;
    this.next.reactive = this.next.can_focus = this.offset < this.maximum;
    this.previous.opacity = this.offset > 0 ? 255 : 90;
    this.next.opacity = this.offset < this.maximum ? 255 : 90;
    const step = Math.max(1, this.viewport.height - 40);
    this.label.text = `${Math.ceil(this.offset / step) + 1} / ${Math.ceil(this.maximum / step) + 1}`;
  }
}
