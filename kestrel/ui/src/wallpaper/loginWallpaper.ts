import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';

const SYNC_DELAY = 1500;
const RECORD = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'login-wallpaper']));

function readRecord(): string {
  try {
    return new TextDecoder().decode(RECORD.load_contents(null)[1]);
  } catch {
    return '';
  }
}

export class LoginWallpaper {
  private readonly background = new Gio.Settings({ schema_id: 'org.gnome.desktop.background' });
  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly signals: [Gio.Settings, number][];
  private timer = 0;

  constructor() {
    this.signals = [
      [this.background, this.background.connect('changed::picture-uri', () => this.schedule())],
      [this.background, this.background.connect('changed::picture-uri-dark', () => this.schedule())],
      [this.interfaceSettings, this.interfaceSettings.connect('changed::color-scheme', () => this.schedule())],
    ];
    this.schedule();
  }

  private schedule(): void {
    if (this.timer) GLib.source_remove(this.timer);
    this.timer = GLib.timeout_add(GLib.PRIORITY_LOW, SYNC_DELAY, () => {
      this.timer = 0;
      this.sync();
      return GLib.SOURCE_REMOVE;
    });
  }

  private sync(): void {
    const dark = this.interfaceSettings.get_string('color-scheme') === 'prefer-dark';
    const file = Gio.File.new_for_uri(this.background.get_string(dark ? 'picture-uri-dark' : 'picture-uri'));
    const descriptors = new Gio.UnixFDList();
    let identity: string;
    try {
      const info = file.query_info('time::modified,standard::size', Gio.FileQueryInfoFlags.NONE, null);
      identity = `${file.get_uri()} ${info.get_modification_date_time()?.to_unix()} ${info.get_size()}`;
      if (identity === readRecord()) return;
      const stream = file.read(null);
      descriptors.append((stream as unknown as GioUnix.FileDescriptorBased).get_fd());
      stream.close(null);
    } catch {
      return;
    }
    Gio.DBus.system.call_with_unix_fd_list('com.lantharos.Greeter1', '/com/lantharos/Greeter1', 'com.lantharos.Greeter1',
      'SetAppearance', new GLib.Variant('(h)', [0]), null, Gio.DBusCallFlags.NONE, -1, descriptors, null, (connection, result) => {
        try {
          connection!.call_with_unix_fd_list_finish(result);
          GLib.mkdir_with_parents(RECORD.get_parent()!.get_path()!, 0o755);
          RECORD.replace_contents(new TextEncoder().encode(identity), null, false, Gio.FileCreateFlags.NONE, null);
        } catch (error) {
          if (!(error instanceof GLib.Error && error.matches(Gio.DBusError, Gio.DBusError.SERVICE_UNKNOWN)))
            console.warn(`The login screen wallpaper was not updated: ${error}`);
        }
      });
  }

  destroy(): void {
    if (this.timer) GLib.source_remove(this.timer);
    for (const [settings, id] of this.signals) settings.disconnect(id);
  }
}
