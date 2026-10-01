import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';

function recordOf(name: string): Gio.File {
  return Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', name]));
}

function readRecord(record: Gio.File): string {
  try {
    return new TextDecoder().decode(record.load_contents(null)[1]);
  } catch {
    return '';
  }
}

export function sendToLoginScreen(method: string, file: Gio.File, recordName: string, description: string): void {
  const record = recordOf(recordName);
  const descriptors = new Gio.UnixFDList();
  let identity: string;
  try {
    const info = file.query_info('time::modified,standard::size', Gio.FileQueryInfoFlags.NONE, null);
    identity = `${file.get_uri()} ${info.get_modification_date_time()?.to_unix()} ${info.get_size()}`;
    if (identity === readRecord(record)) return;
    const stream = file.read(null);
    descriptors.append((stream as unknown as GioUnix.FileDescriptorBased).get_fd());
    stream.close(null);
  } catch {
    return;
  }
  Gio.DBus.system.call_with_unix_fd_list('com.lantharos.Greeter1', '/com/lantharos/Greeter1', 'com.lantharos.Greeter1',
    method, new GLib.Variant('(h)', [0]), null, Gio.DBusCallFlags.NONE, -1, descriptors, null, (connection, result) => {
      try {
        connection!.call_with_unix_fd_list_finish(result);
        GLib.mkdir_with_parents(record.get_parent()!.get_path()!, 0o755);
        record.replace_contents(new TextEncoder().encode(identity), null, false, Gio.FileCreateFlags.NONE, null);
      } catch (error) {
        if (!(error instanceof GLib.Error && error.matches(Gio.DBusError, Gio.DBusError.SERVICE_UNKNOWN)))
          console.warn(`The login screen ${description} was not updated: ${error}`);
      }
    });
}
