import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import { identifyProcess } from '../../../../shared/apps/identity.js';
import { luftAppPrograms } from '../../../../shared/apps/luftApps.js';
import type { ModalDialog } from '../../../../shared/dialogs/modalDialog.js';
import { promptGate } from '../../../../shared/dialogs/promptGate.js';
import { PidFd, stealFd } from '../../../../shared/dbus/processes.js';
import { callerRuns, refuseSandboxed } from '../../../../shared/dbus/sandbox.js';
import { openDriveDialog } from './dialog.js';
import { type MountedDrive, mountedDrive } from './mounted.js';

const PATH = '/com/lantharos/Kestrel/DriveAccess';
const ERROR = 'com.lantharos.Kestrel.DriveAccess.Error';
const SCHELF = 'com.lantharos.schelf';
const JUST_USED = 10 * GLib.USEC_PER_SEC;
const WINDOW = 60 * GLib.USEC_PER_SEC;
const PER_WINDOW = 3;

const SERVICE_XML = `<node>
  <interface name="com.lantharos.Kestrel.DriveAccess">
    <method name="Ask">
      <arg type="h" name="app" direction="in"/>
      <arg type="s" name="drive" direction="in"/>
      <arg type="b" name="allowed" direction="out"/>
    </method>
  </interface>
</node>`;

type Invocation = Gio.DBusMethodInvocation;

const refuse = (invocation: Invocation, kind: string, message: string) => invocation.return_dbus_error(`${ERROR}.${kind}`, message);

/** The sandboxed app the process behind `fd` belongs to, judged by its sandbox while the pidfd holds it. */
function sandboxedApp(fd: number | null): string | null {
  if (fd === null) return null;
  const process = new PidFd(fd);
  try {
    const pid = process.pid;
    const identity = pid ? identifyProcess(pid) : null;
    return identity && 'app' in identity && process.pid === pid ? identity.app : null;
  } finally {
    process.close();
  }
}

/**
 * Asks whether a sandboxed app may use a drive it looked for. Only Schelf's
 * sandbox and its watcher for Flatpak apps may ask, for the app whose process
 * they hand over, and only while that app is in front or was a moment ago.
 * The prompt names the app by its sandbox and the drive by what UDisks says
 * of it, so the asker chooses neither.
 */
export class DriveAccessService {
  private readonly exported = Gio.DBusExportedObject.wrapJSObject(SERVICE_XML, this);
  private readonly focused = new Map<string, number>();
  private readonly asked = new Map<string, number[]>();
  private readonly focusChanged: number;
  private inFrontNow: string | null = null;
  private open: ModalDialog | null = null;

  constructor() {
    this.focusChanged = global.display.connect('notify::focus-window', () => this.noteFocus());
    this.noteFocus();
    this.exported.export(Gio.DBus.session, PATH);
  }

  private noteFocus(): void {
    if (this.inFrontNow) this.focused.set(this.inFrontNow, GLib.get_monotonic_time());
    this.inFrontNow = global.display.focus_window?.get_sandboxed_app_id() ?? null;
  }

  private inFront(app: string): boolean {
    if (global.display.focus_window?.get_sandboxed_app_id() === app) return true;
    const since = this.focused.get(app);
    return since !== undefined && GLib.get_monotonic_time() - since < JUST_USED;
  }

  private tooMany(app: string): boolean {
    const now = GLib.get_monotonic_time();
    const recent = (this.asked.get(app) ?? []).filter(time => now - time < WINDOW);
    this.asked.set(app, recent);
    if (recent.length >= PER_WINDOW) return true;
    recent.push(now);
    return false;
  }

  async AskAsync([index, uuid]: [number, string], invocation: Invocation, fdList: Gio.UnixFDList | null): Promise<void> {
    const app = sandboxedApp(stealFd(fdList, index));
    if (await refuseSandboxed(invocation, 'ask for drives')) return;
    if (!await callerRuns(invocation, luftAppPrograms(SCHELF))) {
      refuse(invocation, 'NotSchelf', 'Only Schelf from the system image can ask whether an app may use a drive');
      return;
    }
    if (!app) {
      refuse(invocation, 'NotSandboxed', 'The process handed over isn\'t in a sandbox');
      return;
    }
    if (promptGate.locked) {
      refuse(invocation, 'Locked', 'The screen is locked');
      return;
    }
    if (!this.inFront(app)) {
      refuse(invocation, 'NotInFront', 'Only the app in front, or one used a moment ago, can be asked about');
      return;
    }
    if (this.open) {
      refuse(invocation, 'Busy', 'Another drive is being asked about');
      return;
    }
    if (this.tooMany(app)) {
      refuse(invocation, 'TooMany', 'This app was asked about drives too often in the last minute');
      return;
    }
    const drive = await mountedDrive(uuid).catch(() => null);
    if (!drive) {
      refuse(invocation, 'Unknown', 'That drive isn\'t mounted');
      return;
    }
    this.ask(invocation, app, drive);
  }

  private ask(invocation: Invocation, appId: string, drive: MountedDrive): void {
    const app = Shell.AppSystem.get_default().lookup_app(`${appId}.desktop`);
    let watch = 0;
    const finish = (allowed: boolean | null) => {
      if (watch) Gio.bus_unwatch_name(watch);
      watch = 0;
      this.open = null;
      if (allowed === null) refuse(invocation, 'Closed', 'The prompt closed without an answer');
      else invocation.return_value(new GLib.Variant('(b)', [allowed]));
    };
    const dialog = openDriveDialog(app?.get_name() ?? appId, app, drive, allowed => finish(allowed));
    if (!dialog) {
      refuse(invocation, 'Locked', 'The prompt couldn\'t be shown');
      return;
    }
    this.open = dialog;
    watch = Gio.bus_watch_name_on_connection(Gio.DBus.session, invocation.get_sender()!, Gio.BusNameWatcherFlags.NONE, null, () => {
      dialog.close();
      finish(null);
    });
  }

  destroy(): void {
    global.display.disconnect(this.focusChanged);
    this.open?.close();
    this.exported.unexport();
  }
}
