import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const PACKAGES = 'com.lantharos.Packages1';
const PACKAGES_PATH = '/com/lantharos/Packages1';
const CALL_TIMEOUT = 60000;

export async function removeFromStoreFolder(id: string): Promise<void> {
  await Gio.DBus.system.call(PACKAGES, PACKAGES_PATH, PACKAGES, 'RemoveExtension', new GLib.Variant('(s)', [id]), null,
    Gio.DBusCallFlags.ALLOW_INTERACTIVE_AUTHORIZATION, CALL_TIMEOUT, null);
}
