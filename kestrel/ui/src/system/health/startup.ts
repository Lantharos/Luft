import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const ON_TRIAL = '/sys/firmware/efi/efivars/LoaderBootCountPath-4a67b082-0a4c-41cf-b6c7-440b29bb8c4f';
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
  if (!GLib.file_test(ON_TRIAL, GLib.FileTest.EXISTS)) return;
  const startup = layoutManager.connect('startup-complete', () => {
    layoutManager.disconnect(startup);
    GLib.timeout_add_seconds(GLib.PRIORITY_LOW, SETTLE_SECONDS, () => {
      confirm();
      return GLib.SOURCE_REMOVE;
    });
  });
}
