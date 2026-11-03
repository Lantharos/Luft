import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { refuseSandboxed } from '../shared/dbus/sandbox.js';
import type { SettingValue } from './api/v1/types.js';
import { API_VERSIONS } from './api/versions.js';
import { listed } from './listing.js';
import type { ExtensionManager } from './runtime/manager.js';

const PATH = '/com/lantharos/Kestrel/Extensions';
const INTERFACE = `<node>
  <interface name="com.lantharos.Kestrel.Extensions">
    <method name="List"><arg type="aa{sv}" name="extensions" direction="out"/></method>
    <method name="Enable"><arg type="s" name="id" direction="in"/></method>
    <method name="Disable"><arg type="s" name="id" direction="in"/></method>
    <method name="Reload"><arg type="s" name="id" direction="in"/></method>
    <method name="Remove"><arg type="s" name="id" direction="in"/></method>
    <method name="SetSetting">
      <arg type="s" name="id" direction="in"/>
      <arg type="s" name="key" direction="in"/>
      <arg type="v" name="value" direction="in"/>
    </method>
    <property name="ApiVersions" type="au" access="read"/>
    <signal name="ExtensionsChanged"/>
  </interface>
</node>`;
const CHANGED_DELAY = 50;

/** Lets Settings and Schelf see, switch, set up, update and remove extensions. Sandboxed apps get nothing. */
export class ExtensionsService {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(INTERFACE, this);
  private readonly unwatch: () => void;
  private changedSource = 0;

  constructor(private readonly manager: ExtensionManager) {
    this.dbus.export(Gio.DBus.session, PATH);
    this.unwatch = manager.watch(() => this.queueChanged());
  }

  get ApiVersions(): number[] {
    return Object.keys(API_VERSIONS).map(Number);
  }

  ListAsync(_parameters: [], invocation: Gio.DBusMethodInvocation): void {
    this.answer(invocation, 'list extensions', () =>
      new GLib.Variant('(aa{sv})', [this.manager.all.map(installed => listed(installed, this.manager))]));
  }

  EnableAsync([id]: [string], invocation: Gio.DBusMethodInvocation): void {
    this.answer(invocation, 'turn extensions on', () => this.manager.enable(id));
  }

  DisableAsync([id]: [string], invocation: Gio.DBusMethodInvocation): void {
    this.answer(invocation, 'turn extensions off', () => this.manager.disable(id));
  }

  ReloadAsync([id]: [string], invocation: Gio.DBusMethodInvocation): void {
    this.answer(invocation, 'reload extensions', () => this.manager.reload(id));
  }

  RemoveAsync([id]: [string], invocation: Gio.DBusMethodInvocation): void {
    this.answer(invocation, 'remove extensions', () => this.manager.remove(id));
  }

  SetSettingAsync([id, key, value]: [string, string, GLib.Variant], invocation: Gio.DBusMethodInvocation): void {
    this.answer(invocation, 'change extension settings', () => this.manager.setSetting(id, key, value.deepUnpack() as SettingValue));
  }

  private answer(invocation: Gio.DBusMethodInvocation, action: string, act: () => GLib.Variant | void): void {
    void refuseSandboxed(invocation, action).then(refused => {
      if (refused) return;
      try {
        invocation.return_value(act() ?? null);
      } catch (error) {
        invocation.return_dbus_error('org.freedesktop.DBus.Error.InvalidArgs', (error as Error).message);
      }
    });
  }

  private queueChanged(): void {
    if (this.changedSource) return;
    this.changedSource = GLib.timeout_add(GLib.PRIORITY_DEFAULT, CHANGED_DELAY, () => {
      this.changedSource = 0;
      this.dbus.emit_signal('ExtensionsChanged', null);
      return GLib.SOURCE_REMOVE;
    });
  }

  destroy(): void {
    if (this.changedSource) GLib.source_remove(this.changedSource);
    this.unwatch();
    this.dbus.unexport();
  }
}
