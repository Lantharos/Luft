import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { busCall } from './bus.js';

const WATCHER_INTERFACE = `<node>
  <interface name="org.kde.StatusNotifierWatcher">
    <method name="RegisterStatusNotifierItem"><arg name="service" type="s" direction="in"/></method>
    <method name="RegisterStatusNotifierHost"><arg name="service" type="s" direction="in"/></method>
    <property name="RegisteredStatusNotifierItems" type="as" access="read"/>
    <property name="IsStatusNotifierHostRegistered" type="b" access="read"/>
    <property name="ProtocolVersion" type="i" access="read"/>
    <signal name="StatusNotifierItemRegistered"><arg type="s"/></signal>
    <signal name="StatusNotifierItemUnregistered"><arg type="s"/></signal>
    <signal name="StatusNotifierHostRegistered"/>
    <signal name="StatusNotifierHostUnregistered"/>
  </interface>
</node>`;

const DEFAULT_ITEM_PATH = '/StatusNotifierItem';
const WELL_KNOWN_NAME = /^[a-zA-Z_-][a-zA-Z0-9_-]*(\.[a-zA-Z_-][a-zA-Z0-9_-]*)+$/;

export interface TrayItemAddress { busName: string; objectPath: string; }

export interface WatcherHost {
  added(id: string, address: TrayItemAddress): void;
  removed(id: string): void;
}

export class StatusNotifierWatcher {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(WATCHER_INTERFACE, this);
  private readonly items = new Map<string, number>();
  private readonly cancellable = new Gio.Cancellable();
  private readonly nameId: number;

  constructor(private readonly host: WatcherHost) {
    this.dbus.export(Gio.DBus.session, '/StatusNotifierWatcher');
    this.nameId = Gio.bus_own_name_on_connection(Gio.DBus.session, 'org.kde.StatusNotifierWatcher', Gio.BusNameOwnerFlags.NONE,
      () => this.dbus.emit_signal('StatusNotifierHostRegistered', new GLib.Variant('()', [])), null);
    void this.discoverRunningItems();
  }

  get RegisteredStatusNotifierItems(): string[] {
    return [...this.items.keys()];
  }

  get IsStatusNotifierHostRegistered(): boolean {
    return true;
  }

  get ProtocolVersion(): number {
    return 0;
  }

  async RegisterStatusNotifierItemAsync([service]: [string], invocation: Gio.DBusMethodInvocation): Promise<void> {
    const sender = invocation.get_sender()!;
    if (service.startsWith('/')) this.register(sender, service);
    else if (WELL_KNOWN_NAME.test(service)) this.register(await this.nameOwner(service) ?? sender, DEFAULT_ITEM_PATH);
    else this.register(service, DEFAULT_ITEM_PATH);
    invocation.return_value(null);
  }

  RegisterStatusNotifierHostAsync(_params: unknown, invocation: Gio.DBusMethodInvocation): void {
    invocation.return_dbus_error('org.freedesktop.DBus.Error.NotSupported', 'Only one tray host is supported');
  }

  destroy(): void {
    this.cancellable.cancel();
    for (const subscription of this.items.values()) Gio.DBus.session.signal_unsubscribe(subscription);
    this.items.clear();
    Gio.bus_unown_name(this.nameId);
    this.dbus.unexport();
  }

  private register(busName: string, objectPath: string): void {
    const id = `${busName}${objectPath}`;
    if (this.items.has(id)) return;
    this.items.set(id, Gio.DBus.session.signal_subscribe('org.freedesktop.DBus', 'org.freedesktop.DBus', 'NameOwnerChanged',
      '/org/freedesktop/DBus', busName, Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [, , newOwner] = parameters.deep_unpack() as [string, string, string];
        if (!newOwner) this.unregister(id);
      }));
    this.dbus.emit_signal('StatusNotifierItemRegistered', new GLib.Variant('(s)', [id]));
    this.host.added(id, { busName, objectPath });
  }

  private unregister(id: string): void {
    const subscription = this.items.get(id);
    if (subscription === undefined) return;
    Gio.DBus.session.signal_unsubscribe(subscription);
    this.items.delete(id);
    this.dbus.emit_signal('StatusNotifierItemUnregistered', new GLib.Variant('(s)', [id]));
    this.host.removed(id);
  }

  private async nameOwner(name: string): Promise<string | null> {
    const reply = await busCall('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'GetNameOwner',
      new GLib.Variant('(s)', [name]), this.cancellable, 1000);
    return reply ? (reply.deep_unpack() as [string])[0] : null;
  }

  private async discoverRunningItems(): Promise<void> {
    const reply = await busCall('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'ListNames', null, this.cancellable);
    if (!reply) return;
    const [names] = reply.deep_unpack() as [string[]];
    await Promise.all(names.filter(name => name.startsWith(':')).map(async name => {
      const found = await busCall(name, DEFAULT_ITEM_PATH, 'org.freedesktop.DBus.Properties', 'Get',
        new GLib.Variant('(ss)', ['org.kde.StatusNotifierItem', 'Id']), this.cancellable, 1000);
      if (found) this.register(name, DEFAULT_ITEM_PATH);
    }));
  }
}
