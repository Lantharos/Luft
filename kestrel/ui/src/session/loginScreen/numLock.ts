import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { tellLoginScreen } from './send.js';

export class LoginNumLock {
  private readonly settings = new Gio.Settings({ schema_id: 'org.gnome.desktop.peripherals.keyboard' });
  private readonly changed = this.settings.connect('changed::numlock-state', () => this.share());

  constructor() {
    this.share();
  }

  private share(): void {
    tellLoginScreen('SetNumLock', new GLib.Variant('(b)', [this.settings.get_boolean('numlock-state')]), 'login-num-lock', 'keyboard state');
  }

  destroy(): void {
    this.settings.disconnect(this.changed);
  }
}
