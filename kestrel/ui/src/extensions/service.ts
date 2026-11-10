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
    <method name="SetShortcut">
      <arg type="s" name="id" direction="in"/>
      <arg type="s" name="key" direction="in"/>
      <arg type="as" name="accelerators" direction="in"/>
    </method>
    <method name="ResetShortcut">
      <arg type="s" name="id" direction="in"/>
      <arg type="s" name="key" direction="in"/>
    </method>
    <method name="Page">
      <arg type="s" name="id" direction="in"/>
      <arg type="s" name="page" direction="out"/>
    </method>
    <method name="Act">
      <arg type="s" name="id" direction="in"/>
      <arg type="s" name="control" direction="in"/>
      <arg type="v" name="value" direction="in"/>
    </method>
    <property name="ApiVersions" type="au" access="read"/>
    <signal name="ExtensionsChanged"/>
    <signal name="PageChanged"><arg type="s" name="id"/></signal>
  </interface>
</node>`;
const CHANGED_DELAY = 50;

export class ExtensionsService {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(INTERFACE, this);
  private readonly unwatch: () => void;
  private readonly unwatchPages: () => void;
  private changedSource = 0;

  constructor(private readonly manager: ExtensionManager) {
    this.dbus.export(Gio.DBus.session, PATH);
    this.unwatch = manager.watch(() => this.queueChanged());
    this.unwatchPages = manager.watchPages(id => this.dbus.emit_signal('PageChanged', new GLib.Variant('(s)', [id])));
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

  SetShortcutAsync([id, key, accelerators]: [string, string, string[]], invocation: Gio.DBusMethodInvocation): void {
    this.answer(invocation, 'change extension shortcuts', () => this.manager.setShortcut(id, key, accelerators));
  }

  ResetShortcutAsync([id, key]: [string, string], invocation: Gio.DBusMethodInvocation): void {
    this.answer(invocation, 'change extension shortcuts', () => this.manager.setShortcut(id, key, null));
  }

  PageAsync([id]: [string], invocation: Gio.DBusMethodInvocation): void {
    this.answer(invocation, 'see extension settings', () => new GLib.Variant('(s)', [this.manager.instance(id)?.page.json() ?? '']));
  }

  ActAsync([id, control, value]: [string, string, GLib.Variant], invocation: Gio.DBusMethodInvocation): void {
    this.answer(invocation, 'change extension settings', () => {
      const instance = this.manager.instance(id);
      if (!instance?.running) throw new Error(`${id} isn't running`);
      instance.page.act(control, value.deepUnpack());
    });
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
    this.unwatchPages();
    this.dbus.unexport();
  }
}
