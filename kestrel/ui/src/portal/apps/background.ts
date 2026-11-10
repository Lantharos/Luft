import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import { removeFile, userFile, writeText } from '../../appearance/files.js';
import { afterMotion, dropAfterMotion } from '../../shared/motion/afterMotion.js';
import { portalObject } from '../core/exported.js';
import { SUCCESS, respond, type Invocation } from '../core/request.js';

const BACKGROUND_XML = `<node><interface name="org.freedesktop.impl.portal.Background">
  <method name="GetAppState"><arg type="a{sv}" direction="out"/></method>
  <method name="NotifyBackground">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="EnableAutostart">
    <arg type="s" direction="in"/><arg type="b" direction="in"/><arg type="as" direction="in"/><arg type="u" direction="in"/>
    <arg type="b" direction="out"/>
  </method>
  <signal name="RunningApplicationsChanged"/>
</interface></node>`;

const RUNNING = 1;
const ACTIVE = 2;
const ALLOW = 1;
const ACTIVATABLE = 1;
const ENTRY = 'Desktop Entry';

function execArgument(argument: string): string {
  const literal = argument.replaceAll('%', '%%');
  return /^[\w@%+=:,./-]+$/.test(literal) ? literal : `"${literal.replace(/["`$\\]/g, '\\$&')}"`;
}

function autostartEntry(appId: string, commandline: string[], flags: number): string {
  const entry = new GLib.KeyFile();
  entry.set_string(ENTRY, 'Type', 'Application');
  entry.set_string(ENTRY, 'Name', Shell.AppSystem.get_default().lookup_app(`${appId}.desktop`)?.get_name() ?? appId);
  entry.set_string(ENTRY, 'Exec', commandline.map(execArgument).join(' '));
  entry.set_string(ENTRY, 'X-Flatpak', appId);
  if (flags & ACTIVATABLE) entry.set_boolean(ENTRY, 'DBusActivatable', true);
  return entry.to_data()[0];
}

function sandboxedApps(): Map<string, Shell.App> {
  const apps = new Map<string, Shell.App>();
  for (const app of Shell.AppSystem.get_default().get_running()) {
    const sandboxedId = app.get_windows().map(window => window.get_sandboxed_app_id()).find(id => id);
    if (sandboxedId) apps.set(sandboxedId, app);
  }
  return apps;
}

export class BackgroundPortal {
  readonly dbus = portalObject(BACKGROUND_XML, this);
  private readonly appSystem = Shell.AppSystem.get_default();
  private readonly tracker = Shell.WindowTracker.get_default();
  private readonly signals: [object: Shell.AppSystem | Shell.WindowTracker, id: number][];
  private visible = new Set(sandboxedApps().keys());
  private readonly syncAfterMotion = () => this.sync();

  constructor() {
    this.signals = [
      [this.appSystem, this.appSystem.connect('app-state-changed', () => afterMotion(this.syncAfterMotion))],
      [this.tracker, this.tracker.connect('tracked-windows-changed', () => afterMotion(this.syncAfterMotion))],
    ];
  }

  GetAppState(): Record<string, GLib.Variant> {
    const focused = this.tracker.focus_app;
    return Object.fromEntries([...sandboxedApps()].map(([id, app]) => [id, new GLib.Variant('u', app === focused ? ACTIVE : RUNNING)]));
  }

  NotifyBackgroundAsync(_parameters: [string, string, string], invocation: Invocation): void {
    respond(invocation, [SUCCESS, { result: new GLib.Variant('u', ALLOW) }]);
  }

  async EnableAutostartAsync([appId, enable, commandline, flags]: [string, boolean, string[], number], invocation: Invocation): Promise<void> {
    if (!Gio.Application.id_is_valid(appId)) throw new Error(`${appId} isn't an app ID`);
    const file = userFile(GLib.get_user_config_dir(), 'autostart', `${appId}.desktop`);
    const starts = enable && commandline.length > 0;
    if (starts) await writeText(file, autostartEntry(appId, commandline, flags));
    else await removeFile(file);
    invocation.return_value(new GLib.Variant('(b)', [starts]));
  }

  destroy(): void {
    dropAfterMotion(this.syncAfterMotion);
    for (const [object, id] of this.signals) object.disconnect(id);
  }

  private sync(): void {
    const visible = new Set(sandboxedApps().keys());
    const changed = visible.size !== this.visible.size || [...visible].some(id => !this.visible.has(id));
    this.visible = visible;
    if (changed) this.dbus.emit_signal('RunningApplicationsChanged', null);
  }
}
