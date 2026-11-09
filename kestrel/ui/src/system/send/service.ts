import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import { identifyProcess } from '../../shared/apps/identity.js';
import { luftAppPrograms, runsProgram } from '../../shared/apps/luftApps.js';
import { callerProcess } from '../../shared/dbus/processes.js';
import { identify } from '../../shared/dbus/sandbox.js';
import { type Handed, receive, sweep } from './received.js';
import { openSendSheet } from './sheet.js';

const PATH = '/com/lantharos/Kestrel/Share';
const INTERFACE = `<node>
  <interface name="com.lantharos.Kestrel.Share">
    <method name="Send"><arg type="a(sh)" name="files" direction="in"/></method>
  </interface>
</node>`;
const WINDOW = 60 * GLib.USEC_PER_SEC;
const SHEETS_PER_WINDOW = 5;

type Invocation = Gio.DBusMethodInvocation;

class Refused extends Error {}

/**
 * Whether an unsandboxed caller owns the window: its own, or one Sabine's shared browser host drew for the Luft app the
 * caller's program is.
 */
function ownedBy(window: Meta.Window, pid: number): boolean {
  if (window.get_pid() === pid) return true;
  const identity = identifyProcess(pid);
  const app = Shell.WindowTracker.get_default().get_window_app(window)?.get_id()?.replace(/\.desktop$/, '');
  return !!identity && 'program' in identity && !!app && runsProgram(identity.program, luftAppPrograms(app));
}

/** The focused window, when it belongs to the app that called: a sheet only opens in front of the app it's for. */
async function callersWindow(invocation: Invocation): Promise<Meta.Window> {
  const window = global.display.focus_window;
  if (!window) throw new Refused('Only the app in front can send files');
  const caller = await identify(invocation);
  if (caller.kind === 'app' && window.get_sandboxed_app_id() === caller.app) return window;
  if (caller.kind === 'you') {
    const process = await callerProcess(invocation);
    try {
      if (process?.pid && ownedBy(window, process.pid)) return window;
    } finally {
      process?.close();
    }
  }
  throw new Refused('Only the app in front can send files');
}

function takeFds(fdList: Gio.UnixFDList | null, files: [string, number][]): Handed[] {
  const fds = fdList?.steal_fds() ?? [];
  const handed = files.map(([name, index]) => ({ name, fd: fds[index] ?? -1 }));
  const used = new Set(handed.map(file => file.fd));
  for (const fd of fds) if (!used.has(fd)) GLib.close(fd);
  if (handed.some(file => file.fd < 0) || used.size !== handed.length) {
    for (const fd of used) if (fd >= 0) GLib.close(fd);
    throw new Error('Every file needs an fd of its own');
  }
  return handed;
}

/**
 * Opens the Send sheet for files an app holds. Apps hand over the files themselves, so a sandboxed app needs no access
 * to where they are, and learn nothing about the devices and apps the sheet offers: people choose there, in Kestrel.
 */
export class ShareService {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(INTERFACE, this);
  private readonly opened = new Map<string, number[]>();
  private showing = false;

  constructor() {
    this.dbus.export(Gio.DBus.session, PATH);
    void sweep().catch(logError);
  }

  SendAsync([files]: [[string, number][]], invocation: Invocation, fdList: Gio.UnixFDList | null): void {
    let handed: Handed[];
    try {
      handed = takeFds(fdList, files);
    } catch (error) {
      invocation.return_dbus_error('org.freedesktop.DBus.Error.InvalidArgs', (error as Error).message);
      return;
    }
    this.send(invocation, handed)
      .then(() => invocation.return_value(null))
      .catch(error => invocation.return_dbus_error(
        error instanceof Refused ? 'org.freedesktop.DBus.Error.AccessDenied' : 'org.freedesktop.DBus.Error.InvalidArgs', (error as Error).message));
  }

  private async send(invocation: Invocation, handed: Handed[]): Promise<void> {
    if (this.showing) {
      for (const { fd } of handed) GLib.close(fd);
      throw new Refused('The Send sheet is already open');
    }
    this.showing = true;
    try {
      const app = await this.admit(invocation).catch(error => {
        for (const { fd } of handed) GLib.close(fd);
        throw error;
      });
      await openSendSheet(await receive(handed), app);
    } finally {
      this.showing = false;
    }
  }

  /** The app the sheet opens for, once it's in front and hasn't opened too many sheets lately. */
  private async admit(invocation: Invocation): Promise<Shell.App | null> {
    const app = Shell.WindowTracker.get_default().get_window_app(await callersWindow(invocation));
    this.count(app?.get_id() ?? invocation.get_sender()!);
    return app;
  }

  private count(caller: string): void {
    const now = GLib.get_monotonic_time();
    const recent = (this.opened.get(caller) ?? []).filter(time => now - time < WINDOW);
    if (recent.length >= SHEETS_PER_WINDOW) throw new Refused('Too many Send sheets opened in the last minute');
    this.opened.set(caller, [...recent, now]);
  }

  destroy(): void {
    this.dbus.unexport();
  }
}
