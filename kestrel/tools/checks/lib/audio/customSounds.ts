import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import {withScheme} from '../../apps/lib/palette.js';
import {removeTree, write} from '../../apps/lib/files.js';
import {changes, withApp} from '../../apps/lib/apps.js';
import {show, showEnd} from '../../apps/settings/navigation.js';
import type {LuftApp} from '../apps/luftApp.js';
import {checks} from '../check.js';
import {call} from '../dbus.js';
import type {Point} from '../input/input.js';
import {scratch} from '../processes.js';
import {output} from '../screenshots.js';
import {settled} from '../wait.js';

const {require, eventually} = checks('sounds');
const NOTIFICATION = 'message-new-instant';
const SCREENSHOT = 'screen-capture';
const SIGN_IN = 'desktop-login';
const STORE = GLib.build_filenamev([GLib.get_user_data_dir(), 'kestrel', 'sounds']);
const SHORT_SECONDS = 0.2;
const SONG_SECONDS = 12;
const SAMPLE_RATE = 8000;
const PITCH = 660;
const LOUDNESS = 8000;
const TIMEOUT = 8000;
const NOTIFICATION_ROW = {x: 320, y: 240, width: 700, height: 100};
const CHOOSE_NOTIFICATION: Point = [956, 274];
const PLAY_NOTIFICATION: Point = [893, 274];
const RESET_NOTIFICATION: Point = [851, 274];
const CHOOSE_FOLDER: Point = [935, 139];
const RESET_ALL: Point = [828, 139];

const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel.sounds'});
const custom = () => settings.get_value('custom').deepUnpack<Record<string, string>>();

function wave(seconds: number) {
  const frames = Math.round(seconds * SAMPLE_RATE);
  const view = new DataView(new ArrayBuffer(44 + 2 * frames));
  const text = (offset: number, value: string) => [...value].forEach((letter, index) => view.setUint8(offset + index, letter.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + 2 * frames, true);
  text(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, 2 * SAMPLE_RATE, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, 2 * frames, true);
  for (let frame = 0; frame < frames; frame++)
    view.setInt16(44 + 2 * frame, LOUDNESS * Math.sin(2 * Math.PI * PITCH * frame / SAMPLE_RATE), true);
  return new Uint8Array(view.buffer);
}

const answerChooser = (path: string) => call('org.freedesktop.impl.portal.desktop.rover', '/org/freedesktop/portal/desktop',
  'com.lantharos.KestrelChecks.FileChooser', 'Answer', new GLib.Variant('(s)', [GLib.filename_to_uri(path, null)]));

async function verdict(path: string) {
  const reply = await call('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Sounds', 'com.lantharos.Kestrel.Sounds', 'Check', new GLib.Variant('(s)', [path]), '(s)');
  return reply.deepUnpack<[string]>()[0];
}

async function choose(app: LuftApp, path: string, button: Point) {
  await answerChooser(path);
  app.click(button);
}

interface Played {
  name: string;
  path: string | null;
}

async function shoot(app: LuftApp, name: string) {
  for (const scheme of ['light', 'dark'] as const) {
    await withScheme(scheme, async () => {
      await settled();
      (await app.settle(() => true)).save(`sounds/${name}-${scheme}`);
    });
  }
}

async function checkChoosing(app: LuftApp, folder: string, notify: () => Promise<unknown>, heard: Played[]) {
  const playedFrom = async (label: string, wanted: (played: Played) => boolean, action: () => unknown) => {
    heard.length = 0;
    await action();
    await eventually(() => heard.some(wanted), label, TIMEOUT);
  };

  const chime = GLib.build_filenamev([folder, 'Chime.wav']);
  const song = GLib.build_filenamev([folder, 'Song.wav']);
  const notes = GLib.build_filenamev([folder, 'Notes.wav']);
  write(chime, wave(SHORT_SECONDS));
  write(song, wave(SONG_SECONDS));
  write(notes, 'Not audio at all');

  require(await verdict(chime) === 'playable', 'a short sound can be used');
  require(await verdict(song) === 'too-long', 'a song can’t');
  require(await verdict(notes) === 'unplayable', 'and neither can a file that isn’t audio');

  await playedFrom('a notification starts out playing Luft’s sound', ({name, path}) => name === NOTIFICATION && !path?.startsWith(STORE), notify);

  await choose(app, chime, CHOOSE_NOTIFICATION);
  await eventually(() => custom()[NOTIFICATION]?.startsWith(STORE), 'choosing a file in Settings stores a copy of it', TIMEOUT);
  const copy = custom()[NOTIFICATION];
  GLib.unlink(chime);
  await playedFrom('the next notification plays the copy, with no restart', ({name, path}) => name === NOTIFICATION && path === copy, notify);
  await playedFrom('and the play button previews it', ({path}) => path === copy, () => app.click(PLAY_NOTIFICATION));
  await settled();
  await shoot(app, 'custom-chosen');

  await changes(app, 'a song shows why it can’t be a system sound', () => choose(app, song, CHOOSE_NOTIFICATION), NOTIFICATION_ROW);
  require(custom()[NOTIFICATION] === copy, 'and keeps the sound that was chosen');
  await shoot(app, 'custom-too-long');

  app.click(RESET_NOTIFICATION);
  await eventually(() => !custom()[NOTIFICATION] && !GLib.file_test(copy, GLib.FileTest.EXISTS), 'resetting forgets the sound and removes its copy', TIMEOUT);
  await playedFrom('and brings back Luft’s sound', ({name, path}) => name === NOTIFICATION && !path?.startsWith(STORE), notify);
}

async function checkSets(app: LuftApp, folder: string, notify: () => Promise<unknown>, heard: Played[]) {
  const set = GLib.build_filenamev([folder, 'Ocean']);
  write(GLib.build_filenamev([set, 'stereo', `${NOTIFICATION}.wav`]), wave(SHORT_SECONDS));
  write(GLib.build_filenamev([set, 'stereo', `${SCREENSHOT}.wav`]), wave(SHORT_SECONDS));
  write(GLib.build_filenamev([set, `${SIGN_IN}.wav`]), 'Not audio at all');

  await choose(app, set, CHOOSE_FOLDER);
  await eventually(() => custom()[NOTIFICATION] && custom()[SCREENSHOT], 'a folder of sounds replaces the sounds it names', TIMEOUT);
  require(!custom()[SIGN_IN], 'and leaves out a file that can’t play');
  heard.length = 0;
  await notify();
  await eventually(() => heard.some(({path}) => path === custom()[NOTIFICATION]), 'a notification plays the set’s sound', TIMEOUT);
  await shoot(app, 'custom-set');

  app.click(RESET_ALL);
  await eventually(() => Object.keys(custom()).length === 0 && !GLib.file_test(STORE, GLib.FileTest.EXISTS), 'resetting every sound empties the store', TIMEOUT);
}

export async function checkCustomSounds(notify: () => Promise<unknown>) {
  const player = Shell.SoundPlayer.get_default();
  const folder = scratch('custom-sounds');
  const heard: Played[] = [];
  const played = player.connect('played', (_player, name, path) => {
    heard.push({name, path});
  });
  try {
    await withApp('settings', [], async app => {
      GLib.mkdir_with_parents(GLib.path_get_dirname(output('sounds/custom')), 0o755);
      await showEnd(app, 'sound');
      await shoot(app, 'system-sounds');
      await show(app, 'sound/custom');
      await shoot(app, 'custom-default');
      await checkChoosing(app, folder, notify, heard);
      await checkSets(app, folder, notify, heard);
    });
  } finally {
    player.disconnect(played);
    settings.reset('custom');
    removeTree(folder);
  }
}
