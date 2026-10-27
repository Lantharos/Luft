import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import { clamp } from '../../../shared/math.js';
import { PILL, styleSurface } from '../../../appearance/kestrelGlass.js';

export class Tooltip extends St.Label {
  static {
    GObject.registerClass(this);
  }

  private timeoutId = 0;

  constructor(private readonly target: St.Widget, params: Partial<St.Label.ConstructorProps>) {
    super(params);
    styleSurface(this, PILL);

    target.connect('notify::hover', () => {
      if (target.hover) this.open();
      else this.close();
    });

    if (!target.label_actor) target.label_actor = this;
  }

  open(): void {
    if (this.timeoutId) return;

    this.timeoutId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, 300, () => {
      this.opacity = 0;
      this.show();

      const extents = this.target.get_transformed_extents();
      const xOffset = Math.floor((extents.get_width() - this.width) / 2);
      const x = clamp(extents.get_x() + xOffset, 0, global.stage.width - this.width);
      const yOffset = this.get_theme_node().get_length('-y-offset');
      const y = extents.get_y() - this.height - yOffset;

      this.set_position(x, y);
      this.ease({
        opacity: 255,
        duration: 150,
        mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      });

      this.timeoutId = 0;
    });
    GLib.Source.set_name_by_id(this.timeoutId, '[kestrel] tooltip.open');
  }

  close(): void {
    if (this.timeoutId) {
      GLib.source_remove(this.timeoutId);
      this.timeoutId = 0;
      return;
    }

    if (!this.visible) return;

    this.remove_all_transitions();
    this.ease({
      opacity: 0,
      duration: 100,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => this.hide(),
    });
  }
}
