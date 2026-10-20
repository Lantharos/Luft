import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import * as MessageTray from 'resource:///com/lantharos/kestrel/ui/messageTray.js';

import { appIcons } from '../../appearance/icons/appIcons.js';
import { formatsLocale, t } from '../../shared/i18n/index.js';

const SYSTEMD = 'org.freedesktop.systemd1';
const OOMD = 'org.freedesktop.oom1';
const UNIT_PATH = '/org/freedesktop/systemd1/unit/';
const APP_UNIT = /^app-(?:(?:kestrel|flatpak|glib|gnome)-)?(.+?)(?:-\d+\.scope|@[^@]*\.service)$/;
const CONTAINER_CGROUP = /\/libpod-[0-9a-f]+\.scope(?:\/|$)/;
const MEGABYTE = 1e6;
const GIGABYTE = 1e9;

const unescapeObjectPath = (path: string) => path.replace(/_([0-9a-f]{2})/g, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16)));
const unescapeUnit = (name: string) => name.replace(/\\x([0-9a-f]{2})/g, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16)));

function memorySize(bytes: number): string {
  const gigabytes = bytes >= GIGABYTE;
  return new Intl.NumberFormat(formatsLocale(), { style: 'unit', unit: gigabytes ? 'gigabyte' : 'megabyte', maximumFractionDigits: 1 })
    .format(gigabytes ? bytes / GIGABYTE : bytes / MEGABYTE);
}

function closedBody(peak: number): string {
  return peak > 0 && peak < Number.MAX_SAFE_INTEGER ? t('oom-closed-body-with-size', { size: memorySize(peak) }) : t('oom-closed-body');
}

export class OomNotifier {
  private readonly unitSubscriptions: number[];
  private readonly oomdSubscription: number;

  constructor() {
    const session = Gio.DBus.session;
    session.call(SYSTEMD, '/org/freedesktop/systemd1', `${SYSTEMD}.Manager`, 'Subscribe', null, null, Gio.DBusCallFlags.NO_AUTO_START, -1, null, null);
    this.unitSubscriptions = ['Scope', 'Service'].map(kind => session.signal_subscribe(SYSTEMD, 'org.freedesktop.DBus.Properties', 'PropertiesChanged',
      null, `${SYSTEMD}.${kind}`, Gio.DBusSignalFlags.NONE, (_connection, _sender, path, _iface, _signal, parameters) => {
        const [, changed] = parameters.deep_unpack() as [string, Record<string, GLib.Variant>];
        if (changed.Result?.deep_unpack() === 'oom-kill') void this.appClosed(path, kind);
      }));
    this.oomdSubscription = Gio.DBus.system.signal_subscribe(OOMD, `${OOMD}.Manager`, 'Killed', '/org/freedesktop/oom1', null,
      Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [cgroup] = parameters.deep_unpack() as [string, string];
        if (CONTAINER_CGROUP.test(cgroup)) this.show(t('oom-container-closed-title'), t('oom-closed-body'), null);
      });
  }

  destroy(): void {
    for (const id of this.unitSubscriptions) Gio.DBus.session.signal_unsubscribe(id);
    Gio.DBus.system.signal_unsubscribe(this.oomdSubscription);
  }

  private async appClosed(path: string, kind: string): Promise<void> {
    const match = APP_UNIT.exec(unescapeObjectPath(path.slice(UNIT_PATH.length)));
    if (!match) return;
    const id = unescapeUnit(match[1]);
    const app = Shell.AppSystem.get_default().lookup_app(`${id}.desktop`);
    const peak = await Gio.DBus.session.call(SYSTEMD, path, 'org.freedesktop.DBus.Properties', 'Get',
      new GLib.Variant('(ss)', [`${SYSTEMD}.${kind}`, 'MemoryPeak']), null, Gio.DBusCallFlags.NONE, 1000, null)
      .then(reply => (reply.deep_unpack() as [GLib.Variant])[0].deep_unpack() as number, () => 0);
    this.show(t('oom-app-closed-title', { app: app?.get_name() ?? id }), closedBody(peak), app);
  }

  private show(title: string, body: string, app: Shell.App | null): void {
    const source = MessageTray.getSystemSource();
    source.addNotification(new MessageTray.Notification({
      source, title, body,
      gicon: app ? appIcons.gicon(app) : new Gio.ThemedIcon({ name: 'dialog-warning-symbolic' }),
    }));
  }
}
