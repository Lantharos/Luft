import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import * as MessageTray from 'resource:///com/lantharos/kestrel/ui/messageTray.js';

import { appIcons } from '../../appearance/icons/appIcons.js';

const SYSTEMD = 'org.freedesktop.systemd1';
const UNIT_PATH = '/org/freedesktop/systemd1/unit/';
const APP_UNIT = /^app-(?:kestrel|flatpak)-(.+)-\d+\.(?:scope|service)$/;

const unescapeObjectPath = (path: string) => path.replace(/_([0-9a-f]{2})/g, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16)));
const unescapeUnit = (name: string) => name.replace(/\\x([0-9a-f]{2})/g, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16)));

export class OomNotifier {
  private readonly subscriptions: number[];

  constructor() {
    const bus = Gio.DBus.session;
    bus.call(SYSTEMD, '/org/freedesktop/systemd1', `${SYSTEMD}.Manager`, 'Subscribe', null, null, Gio.DBusCallFlags.NO_AUTO_START, -1, null, null);
    this.subscriptions = ['Scope', 'Service'].map(kind => bus.signal_subscribe(SYSTEMD, 'org.freedesktop.DBus.Properties', 'PropertiesChanged',
      null, `${SYSTEMD}.${kind}`, Gio.DBusSignalFlags.NONE, (_connection, _sender, path, _iface, _signal, parameters) => {
        const [, changed] = parameters.deep_unpack() as [string, Record<string, GLib.Variant>];
        if (changed.Result?.deep_unpack() === 'oom-kill') void this.notify(path, kind);
      }));
  }

  destroy(): void {
    for (const id of this.subscriptions) Gio.DBus.session.signal_unsubscribe(id);
  }

  private async notify(path: string, kind: string): Promise<void> {
    const unit = unescapeObjectPath(path.slice(UNIT_PATH.length));
    const match = APP_UNIT.exec(unit);
    if (!match) return;
    const id = unescapeUnit(match[1]);
    const app = Shell.AppSystem.get_default().lookup_app(`${id}.desktop`);
    const name = app?.get_name() ?? id;
    const peak = await Gio.DBus.session.call(SYSTEMD, path, 'org.freedesktop.DBus.Properties', 'Get',
      new GLib.Variant('(ss)', [`${SYSTEMD}.${kind}`, 'MemoryPeak']), null, Gio.DBusCallFlags.NONE, 1000, null)
      .then(reply => (reply.deep_unpack() as [GLib.Variant])[0].deep_unpack() as number, () => 0);
    const size = peak > 0 && peak < Number.MAX_SAFE_INTEGER ? ` It was using ${GLib.format_size(peak)}.` : '';
    const source = MessageTray.getSystemSource();
    source.addNotification(new MessageTray.Notification({
      source,
      title: `${name} was closed to free memory`,
      body: `The system was running out of memory, so ${name} was stopped to keep everything else responsive.${size}`,
      gicon: app ? appIcons.gicon(app) : new Gio.ThemedIcon({ name: 'dialog-warning-symbolic' }),
    }));
  }
}
