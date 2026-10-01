import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const PLAYER = 'org.mpris.MediaPlayer2.KestrelCheck';
const MEDIA_KEYS = 'com.lantharos.kestrel.media-keys';
const CUSTOM_PATH = '/com/lantharos/kestrel/media-keys/custom-keybindings/check/';

async function playbackStatus() {
  const reply = await Gio.DBus.session.call(PLAYER, '/org/mpris/MediaPlayer2', 'org.freedesktop.DBus.Properties', 'Get',
    new GLib.Variant('(ss)', ['org.mpris.MediaPlayer2.Player', 'PlaybackStatus']), new GLib.VariantType('(v)'), Gio.DBusCallFlags.NONE, -1, null);
  return reply.recursiveUnpack()[0];
}

export async function checkMediaKeys({pause, keyboard}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel media key check failed: ${label}`);
    console.log(`Kestrel media key check: ${label}`);
  };
  const press = (...keys) => {
    for (const key of keys) keyboard.notify_keyval(GLib.get_monotonic_time(), key, Clutter.KeyState.PRESSED);
    for (const key of keys.reverse()) keyboard.notify_keyval(GLib.get_monotonic_time(), key, Clutter.KeyState.RELEASED);
  };

  const media = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_MEDIA_SCRIPT')], Gio.SubprocessFlags.NONE);
  try {
    await pause(1200);
    press(Clutter.KEY_AudioPlay);
    await pause(400);
    require(await playbackStatus() === 'Paused', 'the play key pauses the playing app');
    press(Clutter.KEY_AudioPlay);
    await pause(400);
    require(await playbackStatus() === 'Playing', 'the play key resumes it');
  } finally {
    media.force_exit();
  }

  const marker = GLib.build_filenamev([GLib.get_user_runtime_dir(), `kestrel-shortcut-${GLib.get_monotonic_time()}`]);
  const mediaKeys = new Gio.Settings({schema_id: MEDIA_KEYS});
  const custom = new Gio.Settings({schema_id: 'com.lantharos.kestrel.custom-keybinding', path: CUSTOM_PATH});
  try {
    custom.set_string('name', 'Leave a mark');
    custom.set_string('command', `touch ${marker}`);
    custom.set_string('binding', '<Super>F12');
    mediaKeys.set_strv('custom-keybindings', [CUSTOM_PATH]);
    await pause(300);
    press(Clutter.KEY_Super_L, Clutter.KEY_F12);
    await pause(800);
    require(GLib.file_test(marker, GLib.FileTest.EXISTS), 'your own shortcuts run their command');
  } finally {
    mediaKeys.reset('custom-keybindings');
    for (const key of ['name', 'command', 'binding']) custom.reset(key);
    GLib.unlink(marker);
  }
}
