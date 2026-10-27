import Gio from 'gi://Gio';

import * as Main from '../main.js';
import { Ripples } from './ripples.js';

const LOCATE_POINTER_SCHEMA = 'org.gnome.desktop.interface';
const LOCATE_POINTER_KEY = 'locate-pointer';

export class LocatePointer {
  private readonly settings = new Gio.Settings({ schema_id: LOCATE_POINTER_SCHEMA });
  private ripples: Ripples | null = null;

  constructor() {
    this.settings.connect(`changed::${LOCATE_POINTER_KEY}`, () => this.syncEnabled());
    this.syncEnabled();
  }

  private syncEnabled(): void {
    const enabled = this.settings.get_boolean(LOCATE_POINTER_KEY);
    if (enabled === !!this.ripples) return;

    if (this.ripples) {
      this.ripples.destroy();
      this.ripples = null;
      return;
    }

    this.ripples = new Ripples(0.5, 0.5, 'ripple-pointer-location', true);
    this.ripples.addTo(Main.uiGroup);
  }

  show(): void {
    if (!this.ripples) return;

    const [x, y] = global.get_pointer();
    this.ripples.playAnimation(x, y);
  }
}
