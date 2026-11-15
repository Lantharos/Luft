import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import { afterMotion, dropAfterMotion } from '../../shared/motion/afterMotion.js';
import { refuseSandboxed } from '../../shared/dbus/sandbox.js';

const OPEN_WINDOWS_XML = `<node><interface name="com.lantharos.Kestrel.OpenWindows">
  <method name="List"><arg type="a{sa(usb)}" name="apps" direction="out"/></method>
  <signal name="Changed"/>
</interface></node>`;

const WINDOW_SIGNALS = ['notify::title', 'notify::is-alive'] as const;

type Listed = [pid: number, title: string, responding: boolean];
type Listing = Record<string, Listed[]>;

function listing(): Listing {
  return Object.fromEntries(Shell.AppSystem.get_default().get_running().map(app => [app.get_id(),
    app.get_windows().map((window): Listed => [window.get_pid(), window.get_title() ?? '', window.is_alive])]));
}

function fingerprint(apps: Listing): string {
  return Object.entries(apps).map(([id, windows]) => `${id}:${windows.map(window => window.join('\u0000')).sort().join('\u0001')}`).sort().join('\u0002');
}

export class OpenWindows {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(OPEN_WINDOWS_XML, this);
  private readonly appSystem = Shell.AppSystem.get_default();
  private readonly tracker = Shell.WindowTracker.get_default();
  private readonly signals: [object: Shell.AppSystem | Shell.WindowTracker, id: number][];
  private readonly windows = new Map<Meta.Window, number[]>();
  private readonly createdSignal: number;
  private shown = fingerprint(listing());
  private readonly syncAfterMotion = () => this.sync();
  private readonly changed = () => afterMotion(this.syncAfterMotion);

  constructor() {
    this.signals = [
      [this.appSystem, this.appSystem.connect('app-state-changed', this.changed)],
      [this.tracker, this.tracker.connect('tracked-windows-changed', this.changed)],
    ];
    this.createdSignal = global.display.connect('window-created', (_display, window: Meta.Window) => this.track(window));
    for (const actor of global.get_window_actors()) this.track(actor.meta_window!);
    this.dbus.export(Gio.DBus.session, '/com/lantharos/Kestrel/OpenWindows');
  }

  ListAsync(_parameters: [], invocation: Gio.DBusMethodInvocation): void {
    void refuseSandboxed(invocation, 'see which apps have windows open').then(refused => {
      if (!refused) invocation.return_value(new GLib.Variant('(a{sa(usb)})', [listing()]));
    });
  }

  destroy(): void {
    dropAfterMotion(this.syncAfterMotion);
    for (const window of [...this.windows.keys()]) this.untrack(window);
    global.display.disconnect(this.createdSignal);
    for (const [object, id] of this.signals) object.disconnect(id);
    this.dbus.unexport();
  }

  private track(window: Meta.Window): void {
    const signals = WINDOW_SIGNALS.map(signal => window.connect(signal, this.changed));
    signals.push(window.connect('unmanaged', () => this.untrack(window)));
    this.windows.set(window, signals);
  }

  private untrack(window: Meta.Window): void {
    for (const id of this.windows.get(window)!) window.disconnect(id);
    this.windows.delete(window);
  }

  private sync(): void {
    const shown = fingerprint(listing());
    if (shown === this.shown) return;
    this.shown = shown;
    this.dbus.emit_signal('Changed', null);
  }
}
