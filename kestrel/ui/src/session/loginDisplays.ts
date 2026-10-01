import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { sendToLoginScreen } from '../shared/loginScreen.js';

const SYNC_DELAY = 1500;

export class LoginDisplays {
  private readonly file = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_config_dir(), 'monitors.xml']));
  private readonly monitor = this.file.monitor_file(Gio.FileMonitorFlags.NONE, null);
  private timer = 0;

  constructor() {
    this.monitor.connect('changed', () => this.schedule());
    this.schedule();
  }

  private schedule(): void {
    if (this.timer) GLib.source_remove(this.timer);
    this.timer = GLib.timeout_add(GLib.PRIORITY_LOW, SYNC_DELAY, () => {
      this.timer = 0;
      sendToLoginScreen('SetDisplays', this.file, 'login-displays', 'display arrangement');
      return GLib.SOURCE_REMOVE;
    });
  }

  destroy(): void {
    if (this.timer) GLib.source_remove(this.timer);
    this.monitor.cancel();
  }
}
