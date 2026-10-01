import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import { SUCCESS, respond, type Invocation } from '../core/request.js';

const BACKGROUND_XML = `<node><interface name="org.freedesktop.impl.portal.Background">
  <method name="GetAppState"><arg type="a{sv}" direction="out"/></method>
  <method name="NotifyBackground">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <signal name="RunningApplicationsChanged"/>
</interface></node>`;

const RUNNING = 1;
const ACTIVE = 2;
const ALLOW = 1;

function sandboxedApps(): Map<string, Shell.App> {
  const apps = new Map<string, Shell.App>();
  for (const app of Shell.AppSystem.get_default().get_running()) {
    const sandboxedId = app.get_windows().map(window => window.get_sandboxed_app_id()).find(id => id);
    if (sandboxedId) apps.set(sandboxedId, app);
  }
  return apps;
}

export class BackgroundPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(BACKGROUND_XML, this);
  private readonly appSystem = Shell.AppSystem.get_default();
  private readonly tracker = Shell.WindowTracker.get_default();
  private readonly signals: [object: Shell.AppSystem | Shell.WindowTracker, id: number][];
  private visible = new Set(sandboxedApps().keys());

  constructor() {
    this.signals = [
      [this.appSystem, this.appSystem.connect('app-state-changed', () => this.sync())],
      [this.tracker, this.tracker.connect('tracked-windows-changed', () => this.sync())],
    ];
  }

  GetAppState(): Record<string, GLib.Variant> {
    const focused = this.tracker.focus_app;
    return Object.fromEntries([...sandboxedApps()].map(([id, app]) => [id, new GLib.Variant('u', app === focused ? ACTIVE : RUNNING)]));
  }

  NotifyBackgroundAsync(_parameters: [string, string, string], invocation: Invocation): void {
    respond(invocation, [SUCCESS, { result: new GLib.Variant('u', ALLOW) }]);
  }

  destroy(): void {
    for (const [object, id] of this.signals) object.disconnect(id);
  }

  private sync(): void {
    const visible = new Set(sandboxedApps().keys());
    const changed = visible.size !== this.visible.size || [...visible].some(id => !this.visible.has(id));
    this.visible = visible;
    if (changed) this.dbus.emit_signal('RunningApplicationsChanged', null as unknown as GLib.Variant);
  }
}
