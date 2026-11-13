import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GLibUnix from 'gi://GLibUnix';
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

interface Asking {
  app: string;
  process: PidFd;
}

/** The sandboxed app the process behind `fd` belongs to, judged by its sandbox while the pidfd holds it. */
function sandboxedApp(fd: number | null): Asking | null {
  if (fd === null) return null;
  const process = new PidFd(fd);
  const pid = process.pid;
  const identity = pid ? identifyProcess(pid) : null;
  if (identity && 'app' in identity && process.pid === pid) return { app: identity.app, process };
  process.close();
  return null;
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
  private open: { dialog: ModalDialog; asking: Asking } | null = null;

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
    const asking = sandboxedApp(stealFd(fdList, index));
    try {
      await this.consider(invocation, asking, uuid);
    } finally {
      if (this.open?.asking !== asking) asking?.process.close();
    }
  }

  private async consider(invocation: Invocation, asking: Asking | null, uuid: string): Promise<void> {
    const app = asking?.app;
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
    this.ask(invocation, asking!, drive);
  }

  /** Shows the prompt until it's answered, the asker leaves or the app's process ends. */
  private ask(invocation: Invocation, asking: Asking, drive: MountedDrive): void {
    const app = Shell.AppSystem.get_default().lookup_app(`${asking.app}.desktop`);
    let watch = 0;
    let exited = 0;
    const finish = (allowed: boolean | null) => {
      if (watch) Gio.bus_unwatch_name(watch);
      if (exited) GLib.source_remove(exited);
      watch = exited = 0;
      this.open = null;
      asking.process.close();
      if (allowed === null) refuse(invocation, 'Closed', 'The prompt closed without an answer');
      else invocation.return_value(new GLib.Variant('(b)', [allowed]));
    };
    const dialog = openDriveDialog(app?.get_name() ?? asking.app, app, drive, allowed => finish(allowed));
    if (!dialog) {
      refuse(invocation, 'Locked', 'The prompt couldn\'t be shown');
      return;
    }
    this.open = { dialog, asking };
    const gone = () => {
      dialog.close();
      finish(null);
    };
    watch = Gio.bus_watch_name_on_connection(Gio.DBus.session, invocation.get_sender()!, Gio.BusNameWatcherFlags.NONE, null, gone);
    exited = GLibUnix.fd_add_full(GLib.PRIORITY_DEFAULT, asking.process.fd, GLib.IOCondition.IN, () => {
      exited = 0;
      gone();
      return GLib.SOURCE_REMOVE;
    });
  }

  destroy(): void {
    global.display.disconnect(this.focusChanged);
    this.open?.dialog.close();
    this.exported.unexport();
  }
}
