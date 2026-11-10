import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import { refuseSandboxed } from '../../shared/dbus/sandbox.js';

const ACTIVATION_XML = `<node><interface name="com.lantharos.Kestrel.Activation">
  <method name="Token">
    <arg type="u" name="pid" direction="in"/>
    <arg type="s" name="token" direction="out"/>
  </method>
</interface></node>`;

const RECENTLY_FOCUSED = 2_000_000;
const INIT = 1;

function parentOf(pid: number): number {
  try {
    const [, bytes] = GLib.file_get_contents(`/proc/${pid}/stat`);
    const stat = new TextDecoder().decode(bytes);
    return Number(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[1]);
  } catch {
    return INIT;
  }
}

function lineage(pid: number): number[] {
  const chain: number[] = [];
  for (let current = pid; current > INIT && !chain.includes(current); current = parentOf(current)) chain.push(current);
  return chain;
}

export class ActivationTokens {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(ACTIVATION_XML, this);
  private readonly focusChanged: number;
  private previous: { window: Meta.Window; until: number } | null = null;
  private focused = global.display.focus_window;

  constructor() {
    this.focusChanged = global.display.connect('notify::focus-window', () => {
      if (this.focused) this.previous = { window: this.focused, until: GLib.get_monotonic_time() + RECENTLY_FOCUSED };
      this.focused = global.display.focus_window;
    });
    this.dbus.export(Gio.DBus.session, '/com/lantharos/Kestrel/Activation');
  }

  TokenAsync([pid]: [number], invocation: Gio.DBusMethodInvocation): void {
    void refuseSandboxed(invocation, 'ask for activation tokens').then(refused => {
      if (refused) return;
      if (!this.inFront(pid)) {
        invocation.return_dbus_error('org.freedesktop.DBus.Error.AccessDenied', 'Only the app in front can bring another window forward');
        return;
      }
      const token = global.create_app_launch_context(0, -1).get_startup_notify_id(null, []);
      invocation.return_value(new GLib.Variant('(s)', [token ?? '']));
    });
  }

  destroy(): void {
    global.display.disconnect(this.focusChanged);
    this.dbus.unexport();
  }

  private inFront(pid: number): boolean {
    const recent = this.previous && GLib.get_monotonic_time() < this.previous.until ? this.previous.window : null;
    const owners = [global.display.focus_window, recent].map(window => window?.get_pid() ?? 0).filter(owner => owner > INIT);
    return lineage(pid).some(ancestor => owners.includes(ancestor));
  }
}
