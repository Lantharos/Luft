import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { sendToLoginScreen, tellLoginScreen } from '../../session/loginScreen/send.js';

const SYNC_DELAY = 1500;
const UNKNOWN_PLACE: [number, number] = [91, 181];

export class LoginWallpaper {
  private readonly background = new Gio.Settings({ schema_id: 'org.gnome.desktop.background' });
  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly kestrel = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly nightLight = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.night-light' });
  private readonly signals: [Gio.Settings, number][];
  private timer = 0;

  constructor() {
    const watch = (settings: Gio.Settings, keys: string[]) =>
      keys.map((key): [Gio.Settings, number] => [settings, settings.connect(`changed::${key}`, () => this.schedule())]);
    this.signals = [
      ...watch(this.background, ['picture-uri', 'picture-uri-dark']),
      ...watch(this.interfaceSettings, ['color-scheme']),
      ...watch(this.kestrel, ['wallpaper-focus', 'wallpaper-focus-dark', 'dark-schedule', 'dark-schedule-from', 'dark-schedule-to', 'rounded-window-corners']),
      ...watch(this.nightLight, ['last-coordinates']),
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
    sendToLoginScreen('SetAppearance', [
      [Gio.File.new_for_uri(this.background.get_string('picture-uri')), this.kestrel.get_value('wallpaper-focus')],
      [Gio.File.new_for_uri(this.background.get_string('picture-uri-dark')), this.kestrel.get_value('wallpaper-focus-dark')],
    ], 'login-wallpaper', 'wallpaper');
    const style = this.interfaceSettings.get_string('color-scheme') === 'prefer-dark' ? 'dark' : 'light';
    const schedule = this.kestrel.get_string('dark-schedule');
    const window: [number, number] = [this.kestrel.get_double('dark-schedule-from'), this.kestrel.get_double('dark-schedule-to')];
    const place = schedule === 'sunset' ? this.nightLight.get_value('last-coordinates').deepUnpack<[number, number]>() : UNKNOWN_PLACE;
    const roundedCorners = this.kestrel.get_boolean('rounded-window-corners');
    tellLoginScreen('SetStyle', new GLib.Variant('(ss(dd)(dd)b)', [style, schedule, window, place, roundedCorners]), 'login-style', 'style');
  }

  destroy(): void {
    if (this.timer) GLib.source_remove(this.timer);
    for (const [settings, id] of this.signals) settings.disconnect(id);
  }
}
