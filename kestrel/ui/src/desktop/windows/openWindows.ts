import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import { afterMotion, dropAfterMotion } from '../../shared/motion/afterMotion.js';
import { refuseSandboxed } from '../../shared/dbus/sandbox.js';

const OPEN_WINDOWS_XML = `<node><interface name="com.lantharos.Kestrel.OpenWindows">
  <method name="List"><arg type="a{sau}" name="apps" direction="out"/></method>
  <signal name="Changed"/>
</interface></node>`;

type Listing = Record<string, number[]>;

function listing(): Listing {
  return Object.fromEntries(Shell.AppSystem.get_default().get_running().map(app => [app.get_id(), app.get_pids()]));
}

function fingerprint(apps: Listing): string {
  return Object.entries(apps).map(([id, pids]) => `${id}:${[...pids].sort().join(',')}`).sort().join(';');
}

/** Tells trusted apps such as Barometer which apps have a window open, and the processes those windows belong to. */
export class OpenWindows {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(OPEN_WINDOWS_XML, this);
  private readonly appSystem = Shell.AppSystem.get_default();
  private readonly tracker = Shell.WindowTracker.get_default();
  private readonly signals: [object: Shell.AppSystem | Shell.WindowTracker, id: number][];
  private shown = fingerprint(listing());
  private readonly syncAfterMotion = () => this.sync();

  constructor() {
    this.signals = [
      [this.appSystem, this.appSystem.connect('app-state-changed', () => afterMotion(this.syncAfterMotion))],
      [this.tracker, this.tracker.connect('tracked-windows-changed', () => afterMotion(this.syncAfterMotion))],
    ];
    this.dbus.export(Gio.DBus.session, '/com/lantharos/Kestrel/OpenWindows');
  }

  ListAsync(_parameters: [], invocation: Gio.DBusMethodInvocation): void {
    void refuseSandboxed(invocation, 'see which apps have windows open').then(refused => {
      if (!refused) invocation.return_value(new GLib.Variant('(a{sau})', [listing()]));
    });
  }

  destroy(): void {
    dropAfterMotion(this.syncAfterMotion);
    for (const [object, id] of this.signals) object.disconnect(id);
    this.dbus.unexport();
  }

  private sync(): void {
    const shown = fingerprint(listing());
    if (shown === this.shown) return;
    this.shown = shown;
    this.dbus.emit_signal('Changed', null);
  }
}
