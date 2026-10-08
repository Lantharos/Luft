import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {property, subscribe} from '../lib/dbus.js';
import {press} from '../lib/input.js';
import {gjs, scratch} from '../lib/processes.js';

const {eventually} = checks('media key');
const PLAYER = 'org.mpris.MediaPlayer2.KestrelCheck';
const MEDIA_KEYS = 'com.lantharos.kestrel.media-keys';
const CUSTOM_PATH = '/com/lantharos/kestrel/media-keys/custom-keybindings/check/';

const playbackStatus = () => property(PLAYER, '/org/mpris/MediaPlayer2', 'org.mpris.MediaPlayer2.Player', 'PlaybackStatus');

function startPlayer() {
  return new Promise((resolve, reject) => {
    const unsubscribe = subscribe({sender: 'org.freedesktop.DBus', iface: 'org.freedesktop.DBus', member: 'NameOwnerChanged'}, (_signal, [name, , owner]) => {
      if (name !== PLAYER || !owner) return;
      unsubscribe();
      playbackStatus().then(resolve, reject);
    });
    gjs('clients/mediaPlayer.js');
  });
}

async function checkPlayer() {
  await startPlayer();
  press(Clutter.KEY_AudioPlay);
  await eventually(async () => await playbackStatus() === 'Paused', 'the play key pauses the playing app');
  press(Clutter.KEY_AudioPlay);
  await eventually(async () => await playbackStatus() === 'Playing', 'the play key resumes it');
}

async function checkCustomShortcut() {
  const marker = scratch('kestrel-custom-shortcut');
  const mediaKeys = new Gio.Settings({schema_id: MEDIA_KEYS});
  const custom = new Gio.Settings({schema_id: 'com.lantharos.kestrel.custom-keybinding', path: CUSTOM_PATH});
  try {
    custom.set_string('name', 'Leave a mark');
    custom.set_string('command', `touch ${marker}`);
    custom.set_string('binding', '<Super>F12');
    mediaKeys.set_strv('custom-keybindings', [CUSTOM_PATH]);
    press(Clutter.KEY_Super_L, Clutter.KEY_F12);
    await eventually(() => GLib.file_test(marker, GLib.FileTest.EXISTS), 'your own shortcuts run their command');
  } finally {
    mediaKeys.reset('custom-keybindings');
    for (const key of ['name', 'command', 'binding']) custom.reset(key);
    GLib.unlink(marker);
  }
}

export async function run() {
  await checkPlayer();
  await checkCustomShortcut();
}
