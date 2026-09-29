import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

async function readAccent() {
  const reply = await Gio.DBus.session.call('org.freedesktop.impl.portal.desktop.kestrel', '/org/freedesktop/portal/desktop',
    'org.freedesktop.impl.portal.Settings', 'Read', new GLib.Variant('(ss)', ['org.freedesktop.appearance', 'accent-color']),
    new GLib.VariantType('(v)'), Gio.DBusCallFlags.NONE, -1, null);
  return JSON.stringify(reply.recursiveUnpack()[0]);
}

export async function checkWallpaperModes({pause, require, wallpapers, video, darkPicture}) {
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const kestrel = new Gio.Settings({schema_id: 'dev.lantharos.kestrel'});
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const lightLive = kestrel.get_string('live-wallpaper');
  const lightStill = background.get_string('picture-uri');
  const lightAccent = await readAccent();
  const darkVideo = await video('smpte', 'dark');
  const visible = () => wallpapers().filter(actor => actor.opacity > 0);
  const playing = () => visible().length > 0 && visible().every(actor => actor.opacity === 255);

  try {
    interfaceSettings.set_string('color-scheme', 'prefer-dark');
    await pause(1200);
    require(visible().length === 0 && background.get_string('picture-uri-dark') === darkPicture, 'dark mode shows its own picture instead of the light video');

    kestrel.set_string('live-wallpaper-dark', darkVideo.get_uri());
    await pause(2500);
    const darkStill = background.get_string('picture-uri-dark');
    require(playing() && darkStill !== darkPicture && Gio.File.new_for_uri(darkStill).query_exists(null) &&
      background.get_string('picture-uri') === lightStill, 'dark mode plays its own video and keeps a still of it');
    const darkAccent = await readAccent();
    require(darkAccent !== lightAccent, 'the accent follows the dark wallpaper');

    interfaceSettings.set_string('color-scheme', 'default');
    await pause(2500);
    require(playing() && Gio.File.new_for_uri(lightStill).query_exists(null) && Gio.File.new_for_uri(darkStill).query_exists(null),
      'light mode plays its video again and both stills stay');
    require(await readAccent() === lightAccent, 'the accent follows the light wallpaper again');

    background.set_string('picture-uri-dark', darkPicture);
    await pause(600);
    require(kestrel.get_string('live-wallpaper-dark') === '' && kestrel.get_string('live-wallpaper') === lightLive,
      'choosing a dark picture ends only the dark live wallpaper');
  } finally {
    interfaceSettings.set_string('color-scheme', 'default');
    kestrel.reset('live-wallpaper-dark');
    darkVideo.delete(null);
  }
}
