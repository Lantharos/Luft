import Gio from 'gi://Gio';

import { PointerEnlarger } from './pointerEnlarger.js';

export class LocatePointer {
  private readonly desktop = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly kestrel = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly tracker = global.backend.get_cursor_tracker();
  private readonly enlarger = new PointerEnlarger();
  private shaken = 0;

  constructor() {
    this.kestrel.connect('changed::shake-to-find-pointer', () => this.syncShake());
    this.syncShake();
  }

  show(): void {
    if (this.desktop.get_boolean('locate-pointer')) this.enlarger.enlarge();
  }

  private syncShake(): void {
    const enabled = this.kestrel.get_boolean('shake-to-find-pointer');
    if (enabled === !!this.shaken) return;

    if (enabled) {
      this.shaken = this.tracker.connect('pointer-shaken', () => this.enlarger.enlarge());
      return;
    }

    this.tracker.disconnect(this.shaken);
    this.shaken = 0;
    this.enlarger.destroy();
  }
}
