import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import * as MessageTray from '../../surfaces/notifications/tray/messageTray.js';

import { appIcons } from '../../appearance/icons/appIcons.js';
import { formatsLocale, t } from '../../shared/i18n/index.js';

const SYSTEMD = 'org.freedesktop.systemd1';
const OOMD = 'org.freedesktop.oom1';
const UNIT_PATH = '/org/freedesktop/systemd1/unit/';
const APP_UNIT = /^app-(?:(?:kestrel|flatpak|glib|gnome)-)?(.+?)(?:-\d+\.scope|@[^@]*\.service)$/;
const CONTAINER_UNIT = /^libpod-[0-9a-f]+\.scope$/;
const UNIT_SUFFIX = /\.(?:scope|service)$/;
const CONTAINER_CGROUP = /\/libpod-[0-9a-f]+\.scope(?:\/|$)/;
const SIGKILL = 9;
const MEGABYTE = 1e6;
const GIGABYTE = 1e9;

const MEMORY_INTERFACE = `<node>
  <interface name="com.lantharos.Kestrel.Memory">
    <method name="RunningLow">
      <arg type="s" name="unit" direction="in"/>
      <arg type="t" name="bytes" direction="in"/>
    </method>
    <method name="Closed">
      <arg type="s" name="unit" direction="in"/>
      <arg type="t" name="bytes" direction="in"/>
    </method>
  </interface>
</node>`;

interface Warning {
  unit: string;
  notification: MessageTray.Notification;
}

interface Holder {
  app: Shell.App | null;
  name: string | null;
}

const unescapeObjectPath = (path: string) => path.replace(/_([0-9a-f]{2})/g, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16)));
const unescapeUnit = (name: string) => name.replace(/\\x([0-9a-f]{2})/g, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16)));

function appHolder(match: RegExpExecArray): Holder {
  const id = unescapeUnit(match[1]);
  const app = Shell.AppSystem.get_default().lookup_app(`${id}.desktop`);
  return { app, name: app?.get_name() ?? id };
}

function holder(unit: string): Holder {
  const match = APP_UNIT.exec(unit);
  if (match) return appHolder(match);
  return { app: null, name: CONTAINER_UNIT.test(unit) ? null : unit.replace(UNIT_SUFFIX, '') };
}

function memorySize(bytes: number): string {
  const gigabytes = bytes >= GIGABYTE;
  return new Intl.NumberFormat(formatsLocale(), { style: 'unit', unit: gigabytes ? 'gigabyte' : 'megabyte', maximumFractionDigits: 1 })
    .format(gigabytes ? bytes / GIGABYTE : bytes / MEGABYTE);
}

function closedTitle({ name }: Holder): string {
  return name === null ? t('oom-container-closed-title') : t('oom-app-closed-title', { app: name });
}

function closedBody(peak: number): string {
  return peak > 0 && peak < Number.MAX_SAFE_INTEGER ? t('oom-closed-body-with-size', { size: memorySize(peak) }) : t('oom-closed-body');
}

function runningLowBody({ name }: Holder, bytes: number): string {
  const size = memorySize(bytes);
  return name === null ? t('memory-low-container-body', { size }) : t('memory-low-app-body', { app: name, size });
}

export class MemoryNotices {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(MEMORY_INTERFACE, this);
  private readonly unitSubscriptions: number[];
  private readonly unitRemovedSubscription: number;
  private readonly oomdSubscription: number;
  private warning: Warning | null = null;

  constructor() {
    const session = Gio.DBus.session;
    session.call(SYSTEMD, '/org/freedesktop/systemd1', `${SYSTEMD}.Manager`, 'Subscribe', null, null, Gio.DBusCallFlags.NO_AUTO_START, -1, null, null);
    this.unitSubscriptions = ['Scope', 'Service'].map(kind => session.signal_subscribe(SYSTEMD, 'org.freedesktop.DBus.Properties', 'PropertiesChanged',
      null, `${SYSTEMD}.${kind}`, Gio.DBusSignalFlags.NONE, (_connection, _sender, path, _iface, _signal, parameters) => {
        const [, changed] = parameters.deep_unpack() as [string, Record<string, GLib.Variant>];
        if (changed.Result?.deep_unpack() === 'oom-kill') void this.appClosed(path, kind);
      }));
    this.unitRemovedSubscription = session.signal_subscribe(SYSTEMD, `${SYSTEMD}.Manager`, 'UnitRemoved', '/org/freedesktop/systemd1', null,
      Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [unit] = parameters.deep_unpack() as [string, string];
        if (unit === this.warning?.unit) this.warning.notification.destroy();
      });
    this.oomdSubscription = Gio.DBus.system.signal_subscribe(OOMD, `${OOMD}.Manager`, 'Killed', '/org/freedesktop/oom1', null,
      Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [cgroup] = parameters.deep_unpack() as [string, string];
        if (CONTAINER_CGROUP.test(cgroup)) this.show(t('oom-container-closed-title'), t('oom-closed-body'), null);
      });
    this.dbus.export(session, '/com/lantharos/Kestrel/Memory');
  }

  destroy(): void {
    this.dbus.unexport();
    for (const id of [...this.unitSubscriptions, this.unitRemovedSubscription]) Gio.DBus.session.signal_unsubscribe(id);
    Gio.DBus.system.signal_unsubscribe(this.oomdSubscription);
    this.warning?.notification.destroy();
  }

  RunningLow(unit: string, bytes: number): void {
    const using = holder(unit);
    this.warning?.notification.destroy();
    const source = MessageTray.getSystemSource();
    const notification = new MessageTray.Notification({
      source,
      title: t('memory-low-title'),
      body: runningLowBody(using, bytes),
      gicon: using.app ? appIcons.gicon(using.app) : new Gio.ThemedIcon({ name: 'dialog-warning-symbolic' }),
      urgency: MessageTray.Urgency.CRITICAL,
    });
    notification.addAction(t('memory-low-force-quit'), () => Gio.DBus.session.call(SYSTEMD, '/org/freedesktop/systemd1', `${SYSTEMD}.Manager`, 'KillUnit',
      new GLib.Variant('(ssi)', [unit, 'all', SIGKILL]), null, Gio.DBusCallFlags.NONE, -1, null, null));
    const warning = { unit, notification };
    notification.connect('destroy', () => {
      if (this.warning === warning) this.warning = null;
    });
    this.warning = warning;
    source.addNotification(notification);
  }

  Closed(unit: string, bytes: number): void {
    const closed = holder(unit);
    this.show(closedTitle(closed), closedBody(bytes), closed.app);
  }

  private async appClosed(path: string, kind: string): Promise<void> {
    const match = APP_UNIT.exec(unescapeObjectPath(path.slice(UNIT_PATH.length)));
    if (!match) return;
    const closed = appHolder(match);
    const peak = await Gio.DBus.session.call(SYSTEMD, path, 'org.freedesktop.DBus.Properties', 'Get',
      new GLib.Variant('(ss)', [`${SYSTEMD}.${kind}`, 'MemoryPeak']), null, Gio.DBusCallFlags.NONE, 1000, null)
      .then(reply => (reply.deep_unpack() as [GLib.Variant])[0].deep_unpack() as number, () => 0);
    this.show(closedTitle(closed), closedBody(peak), closed.app);
  }

  private show(title: string, body: string, app: Shell.App | null): void {
    this.warning?.notification.destroy();
    const source = MessageTray.getSystemSource();
    source.addNotification(new MessageTray.Notification({
      source, title, body,
      gicon: app ? appIcons.gicon(app) : new Gio.ThemedIcon({ name: 'dialog-warning-symbolic' }),
    }));
  }
}
