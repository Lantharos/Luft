import type Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import St from 'gi://St';

import * as Main from '../../core/main.js';
import { PILL, styleSurface } from '../../appearance/kestrelGlass.js';
import { clamp } from '../../shared/math.js';
import { Curve, Duration } from '../../shared/motion/motion.js';

const DELAY = 500;
const GAP = 6;

export function appKind(app: Gio.AppInfo, name: string): string | null {
  const kind = app instanceof GioUnix.DesktopAppInfo ? app.get_generic_name() : null;
  return kind && kind.toLocaleLowerCase() !== name.toLocaleLowerCase() ? kind : null;
}

export class AppHint {
  private readonly label = new St.Label({ style_class: 'kestrel-start-hint', visible: false });
  private timeout = 0;
  private target: St.Widget | null = null;

  constructor() {
    styleSurface(this.label, PILL);
    Main.layoutManager.uiGroup.add_child(this.label);
  }

  bind(button: St.Widget, text: string): void {
    button.connect('notify::hover', () => (button.hover ? this.open(button, text) : this.close(button)));
    button.connect('notify::mapped', () => { if (!button.mapped) this.close(button); });
    button.connect('destroy', () => this.close(button));
  }

  destroy(): void {
    this.cancel();
    this.label.destroy();
  }

  private open(button: St.Widget, text: string): void {
    this.cancel();
    this.target = button;
    this.timeout = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, DELAY, () => {
      this.timeout = 0;
      if (!button.mapped) return;
      this.label.text = text;
      const [x, y] = button.get_transformed_position();
      const [buttonWidth, buttonHeight] = button.get_transformed_size();
      const [, width] = this.label.get_preferred_width(-1);
      this.label.set_position(Math.round(clamp(x + (buttonWidth - width) / 2, 0, global.stage.width - width)), Math.round(y + buttonHeight + GAP));
      Main.layoutManager.uiGroup.set_child_above_sibling(this.label, null);
      this.label.opacity = 0;
      this.label.show();
      this.label.ease({ opacity: 255, duration: Duration.brisk, curve: Curve.gentle });
    });
  }

  private close(button: St.Widget): void {
    if (this.target !== button) return;
    this.cancel();
    this.target = null;
    this.label.remove_all_transitions();
    this.label.hide();
  }

  private cancel(): void {
    if (!this.timeout) return;
    GLib.source_remove(this.timeout);
    this.timeout = 0;
  }
}
