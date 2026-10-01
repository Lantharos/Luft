import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Invocation, Options } from '../core/request.js';

const NOTIFICATION_XML = `<node><interface name="org.freedesktop.impl.portal.Notification">
  <method name="AddNotification"><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/></method>
  <method name="RemoveNotification"><arg type="s" direction="in"/><arg type="s" direction="in"/></method>
  <signal name="ActionInvoked"><arg type="s"/><arg type="s"/><arg type="s"/><arg type="av"/></signal>
  <property name="SupportedOptions" type="a{sv}" access="read"/>
  <property name="version" type="u" access="read"/>
</interface></node>`;

const NOTIFICATIONS = ['org.gtk.Notifications', '/org/gtk/Notifications', 'org.gtk.Notifications'] as const;

function applicationPath(appId: string): string {
  return `/${appId.replaceAll('.', '/').replaceAll('-', '_')}`;
}

export class NotificationPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(NOTIFICATION_XML, this);
  readonly version = 1;
  readonly SupportedOptions = {};
  private readonly subscription = Gio.DBus.session.signal_subscribe(null, NOTIFICATIONS[2], 'ActionInvoked', NOTIFICATIONS[1], null,
    Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => this.invoked(parameters));

  AddNotificationAsync([appId, id, notification]: [string, string, Options], invocation: Invocation): void {
    this.forward(invocation, 'AddNotification', new GLib.Variant('(ssa{sv})', [appId, id, notification]));
  }

  RemoveNotificationAsync([appId, id]: [string, string], invocation: Invocation): void {
    this.forward(invocation, 'RemoveNotification', new GLib.Variant('(ss)', [appId, id]));
  }

  destroy(): void {
    Gio.DBus.session.signal_unsubscribe(this.subscription);
  }

  private forward(invocation: Invocation, method: string, parameters: GLib.Variant): void {
    Gio.DBus.session.call(...NOTIFICATIONS, method, parameters, null, Gio.DBusCallFlags.NONE, -1, null)
      .then(() => invocation.return_value(null))
      .catch((error: GLib.Error) => invocation.return_gerror(error));
  }

  private invoked(parameters: GLib.Variant): void {
    const [appId, id, action, parameter, platformData] = parameters.deepUnpack() as [string, string, string, GLib.Variant[], Options];
    const token = platformData['activation-token'];
    const activation: Options = token ? { 'activation-token': token, 'desktop-startup-id': token } : {};
    Gio.DBus.session.call(appId, applicationPath(appId), 'org.freedesktop.Application', 'Activate',
      new GLib.Variant('(a{sv})', [activation]), null, Gio.DBusCallFlags.NONE, -1, null).catch(() => {});
    this.dbus.emit_signal('ActionInvoked', new GLib.Variant('(sssav)', [appId, id, action, parameter]));
  }
}
