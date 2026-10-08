import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { sendToLoginScreen } from '../../session/loginScreen/send.js';

const SYNC_DELAY = 1500;

export class LoginWallpaper {
  private readonly background = new Gio.Settings({ schema_id: 'org.gnome.desktop.background' });
  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly signals: [Gio.Settings, number][];
  private timer = 0;

  constructor() {
    this.signals = [
      [this.background, this.background.connect('changed::picture-uri', () => this.schedule())],
      [this.background, this.background.connect('changed::picture-uri-dark', () => this.schedule())],
      [this.interfaceSettings, this.interfaceSettings.connect('changed::color-scheme', () => this.schedule())],
    ];
    this.schedule();
  }

  private schedule(): void {
    if (this.timer) GLib.source_remove(this.timer);
    this.timer = GLib.timeout_add(GLib.PRIORITY_LOW, SYNC_DELAY, () => {
      this.timer = 0;
      this.sync();
      return GLib.SOURCE_REMOVE;
    });
  }

  private sync(): void {
    const dark = this.interfaceSettings.get_string('color-scheme') === 'prefer-dark';
    const file = Gio.File.new_for_uri(this.background.get_string(dark ? 'picture-uri-dark' : 'picture-uri'));
    sendToLoginScreen('SetAppearance', file, 'login-wallpaper', 'wallpaper');
  }

  destroy(): void {
    if (this.timer) GLib.source_remove(this.timer);
    for (const [settings, id] of this.signals) settings.disconnect(id);
  }
}
