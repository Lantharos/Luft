import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import System from 'system';

const NAME = 'com.lantharos.Accounts1';
const PATH = '/com/lantharos/Accounts1';

const [iface, method, signature, values, passwordFile] = ARGV;
const parameters = signature ? new GLib.Variant(signature, JSON.parse(values)) : null;
const fds = passwordFile ? Gio.UnixFDList.new_from_array([GLib.open(passwordFile, 0, 0)]) : null;

try {
  const [reply] = Gio.DBus.session.call_with_unix_fd_list_sync(NAME, PATH, iface, method, parameters, null, Gio.DBusCallFlags.NONE, -1, fds, null);
  print(JSON.stringify(reply.recursiveUnpack()));
} catch (error) {
  printerr(error instanceof GLib.Error ? Gio.DBusError.get_remote_error(error) ?? error.message : String(error));
  System.exit(1);
}
