import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';

const ON_TRIAL = '/sys/firmware/efi/efivars/LuftBootTrying-b6a4c1e2-3f5d-4c8a-9e71-2d0f6a8b5c3e';
const SETTLE_SECONDS = 5;

export interface StartupSignals {
  connect(signal: 'startup-complete', callback: () => void): number;
  disconnect(id: number): void;
}

function confirm(): void {
  Gio.DBus.system.call('com.lantharos.Trust1', '/com/lantharos/Trust1', 'com.lantharos.Trust1', 'ConfirmStartup',
    null, null, Gio.DBusCallFlags.NONE, -1, null, (connection, result) => {
      try {
        connection!.call_finish(result);
      } catch (error) {
        console.warn(`This start of Luft couldn't be confirmed: ${error}`);
      }
    });
}

export function confirmStartupOnceSettled(layoutManager: StartupSignals): void {
  const shell = global as unknown as Shell.Global;
  if (shell.backend.is_headless() || !GLib.file_test(ON_TRIAL, GLib.FileTest.EXISTS)) return;
  const startup = layoutManager.connect('startup-complete', () => {
    layoutManager.disconnect(startup);
    GLib.timeout_add_seconds(GLib.PRIORITY_LOW, SETTLE_SECONDS, () => {
      confirm();
      return GLib.SOURCE_REMOVE;
    });
  });
}
