import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../../lib/check.js';
import {call} from '../../lib/portal.js';
import {makeVideo, wallpapers} from './video.js';

const {require, eventually} = checks('live wallpaper');
const VIDEO_TIMEOUT = 10000;

async function readAccent() {
  const reply = await call('Settings', 'Read', new GLib.Variant('(ss)', ['org.freedesktop.appearance', 'accent-color']), '(v)');
  return JSON.stringify(reply.recursiveUnpack()[0]);
}

const exists = uri => Gio.File.new_for_uri(uri).query_exists(null);

export async function checkWallpaperModes(darkPicture) {
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const lightLive = kestrel.get_string('live-wallpaper');
  const lightStill = background.get_string('picture-uri');
  const lightAccent = await readAccent();
  const darkVideo = await makeVideo('smpte', 'dark');
  const visible = () => wallpapers().filter(actor => actor.opacity > 0);
  const playing = () => visible().length > 0 && visible().every(actor => actor.opacity === 255);

  try {
    interfaceSettings.set_string('color-scheme', 'prefer-dark');
    await eventually(() => visible().length === 0 && background.get_string('picture-uri-dark') === darkPicture,
      'dark mode shows its own picture instead of the light video');

    kestrel.set_string('live-wallpaper-dark', darkVideo.get_uri());
    await eventually(() => {
      const darkStill = background.get_string('picture-uri-dark');
      return playing() && darkStill !== darkPicture && exists(darkStill) && background.get_string('picture-uri') === lightStill;
    }, 'dark mode plays its own video and keeps a still of it', VIDEO_TIMEOUT);
    const darkStill = background.get_string('picture-uri-dark');
    await eventually(async () => await readAccent() !== lightAccent, 'the accent follows the dark wallpaper');

    interfaceSettings.set_string('color-scheme', 'default');
    await eventually(() => playing() && exists(lightStill) && exists(darkStill), 'light mode plays its video again and both stills stay', VIDEO_TIMEOUT);
    await eventually(async () => await readAccent() === lightAccent, 'the accent follows the light wallpaper again');

    background.set_string('picture-uri-dark', darkPicture);
    await eventually(() => kestrel.get_string('live-wallpaper-dark') === '', 'choosing a dark picture ends the dark live wallpaper');
    require(kestrel.get_string('live-wallpaper') === lightLive, 'choosing a dark picture keeps the light live wallpaper');
  } finally {
    interfaceSettings.set_string('color-scheme', 'default');
    kestrel.reset('live-wallpaper-dark');
    darkVideo.delete(null);
  }
}
