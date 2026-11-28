import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import * as MessageTray from '../../../surfaces/notifications/tray/messageTray.js';

import { appIcons } from '../../../appearance/icons/appIcons.js';
import { systemPrograms } from '../../../shared/apps/luftApps.js';
import { callerRuns } from '../../../shared/dbus/sandbox.js';
import { formatsLocale, t } from '../../../shared/i18n/index.js';
import { type Closed, type ListedWindow, MemoryWindows } from './memoryWindows.js';

const SYSTEMD = 'org.freedesktop.systemd1';
const UNIT_PATH = '/org/freedesktop/systemd1/unit/';
const APP_UNIT = /^app-(?:(?:kestrel|flatpak|glib|gnome)-)?(.+?)(?:-\d+\.scope|@[^@]*\.service)$/;
const CONTAINER_UNIT = /^libpod-[0-9a-f]+\.scope$/;
const UNIT_SUFFIX = /\.(?:scope|service)$/;
const SIGKILL = 9;
const MEGABYTE = 1e6;
const GIGABYTE = 1e9;
const CLOSED_WINDOWS_SETTLE_MS = 1000;
const MEMORY_WATCHER = systemPrograms('kestrel-settings');

const MEMORY_INTERFACE = `<node>
  <interface name="com.lantharos.Kestrel.Memory">
    <method name="RunningLow">
      <arg type="s" name="unit" direction="in"/>
      <arg type="s" name="app" direction="in"/>
      <arg type="s" name="name" direction="in"/>
      <arg type="t" name="bytes" direction="in"/>
      <arg type="b" name="growing" direction="in"/>
    </method>
    <method name="Closed">
      <arg type="s" name="unit" direction="in"/>
      <arg type="s" name="app" direction="in"/>
      <arg type="s" name="name" direction="in"/>
      <arg type="t" name="bytes" direction="in"/>
    </method>
    <property name="Windows" type="a(usssbb)" access="read"/>
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

function unitHolder(unit: string): Holder {
  const match = APP_UNIT.exec(unit);
  if (!match) return { app: null, name: CONTAINER_UNIT.test(unit) ? null : unit.replace(UNIT_SUFFIX, '') };
  const id = unescapeUnit(match[1]);
  const app = Shell.AppSystem.get_default().lookup_app(`${id}.desktop`);
  return { app, name: app?.get_name() ?? id };
}

function holder(unit: string, { app: id, name }: Closed): Holder {
  const app = id ? Shell.AppSystem.get_default().lookup_app(id) : null;
  if (app || name) return { app, name: name || app!.get_name() };
  return unitHolder(unit);
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

function warningTitle({ name }: Holder, growing: boolean): string {
  if (!growing) return t('memory-low-title');
  return name === null ? t('memory-growing-container-title') : t('memory-growing-title', { app: name });
}

function warningBody({ name }: Holder, bytes: number, growing: boolean): string {
  const size = memorySize(bytes);
  if (growing) return t('memory-growing-body', { size });
  return name === null ? t('memory-low-container-body', { size }) : t('memory-low-app-body', { app: name, size });
}

const icon = (app: Shell.App | null) => app ? appIcons.gicon(app) : new Gio.ThemedIcon({ name: 'dialog-warning-symbolic' });

export class MemoryNotices {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(MEMORY_INTERFACE, this);
  private readonly windows = new MemoryWindows(windows => this.dbus.emit_property_changed('Windows', new GLib.Variant('a(usssbb)', windows)));
  private readonly unitSubscriptions: number[];
  private readonly unitRemovedSubscription: number;
  private warning: Warning | null = null;

  constructor() {
    const session = Gio.DBus.session;
    session.call(SYSTEMD, '/org/freedesktop/systemd1', `${SYSTEMD}.Manager`, 'Subscribe', null, null, Gio.DBusCallFlags.NO_AUTO_START, -1, null, null);
    this.unitSubscriptions = ['Scope', 'Service'].map(kind => session.signal_subscribe(SYSTEMD, 'org.freedesktop.DBus.Properties', 'PropertiesChanged',
      null, `${SYSTEMD}.${kind}`, Gio.DBusSignalFlags.NONE, (_connection, _sender, path, _iface, _signal, parameters) => {
        const [, changed] = parameters.deep_unpack() as [string, Record<string, GLib.Variant>];
        if (changed.Result?.deep_unpack() === 'oom-kill') this.appClosed(path, kind);
      }));
    this.unitRemovedSubscription = session.signal_subscribe(SYSTEMD, `${SYSTEMD}.Manager`, 'UnitRemoved', '/org/freedesktop/systemd1', null,
      Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [unit] = parameters.deep_unpack() as [string, string];
        if (unit === this.warning?.unit) this.warning.notification.destroy();
      });
    this.dbus.export(session, '/com/lantharos/Kestrel/Memory');
  }

  get Windows(): ListedWindow[] {
    return this.windows.current;
  }

  destroy(): void {
    this.dbus.unexport();
    this.windows.destroy();
    for (const id of [...this.unitSubscriptions, this.unitRemovedSubscription]) Gio.DBus.session.signal_unsubscribe(id);
    this.warning?.notification.destroy();
  }

  RunningLowAsync([unit, app, name, bytes, growing]: [string, string, string, number, boolean], invocation: Gio.DBusMethodInvocation): void {
    this.reported(invocation, () => this.runningLow(unit, holder(unit, { app, name }), bytes, growing));
  }

  ClosedAsync([unit, app, name, bytes]: [string, string, string, number], invocation: Gio.DBusMethodInvocation): void {
    this.reported(invocation, () => {
      const closed = holder(unit, { app, name });
      this.show(closedTitle(closed), closedBody(bytes), closed.app);
    });
  }

  private reported(invocation: Gio.DBusMethodInvocation, show: () => void): void {
    void callerRuns(invocation, MEMORY_WATCHER).then(allowed => {
      if (!allowed) {
        invocation.return_dbus_error('org.freedesktop.DBus.Error.AccessDenied', 'Only kestrel-settings can report low memory');
        return;
      }
      show();
      invocation.return_value(null);
    });
  }

  private runningLow(unit: string, using: Holder, bytes: number, growing: boolean): void {
    this.warning?.notification.destroy();
    const source = MessageTray.getSystemSource();
    const notification = new MessageTray.Notification({
      source,
      title: warningTitle(using, growing),
      body: warningBody(using, bytes, growing),
      gicon: icon(using.app),
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

  private appClosed(path: string, kind: string): void {
    const unit = unescapeObjectPath(path.slice(UNIT_PATH.length));
    if (!APP_UNIT.test(unit)) return;
    const peak = Gio.DBus.session.call(SYSTEMD, path, 'org.freedesktop.DBus.Properties', 'Get',
      new GLib.Variant('(ss)', [`${SYSTEMD}.${kind}`, 'MemoryPeak']), null, Gio.DBusCallFlags.NONE, 1000, null)
      .then(reply => (reply.deep_unpack() as [GLib.Variant])[0].deep_unpack() as number, () => 0);
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, CLOSED_WINDOWS_SETTLE_MS, () => {
      const closed = this.windows.recentlyClosed(unit);
      const using = closed ? holder(unit, closed) : unitHolder(unit);
      void peak.then(bytes => this.show(closedTitle(using), closedBody(bytes), using.app));
      return GLib.SOURCE_REMOVE;
    });
  }

  private show(title: string, body: string, app: Shell.App | null): void {
    this.warning?.notification.destroy();
    const source = MessageTray.getSystemSource();
    source.addNotification(new MessageTray.Notification({ source, title, body, gicon: icon(app) }));
  }
}
