import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {withApp} from '../apps/lib/apps.js';
import {children, exists} from '../apps/lib/files.js';
import {showEnd} from '../apps/settings/navigation.js';
import {checks} from '../lib/check.js';
import {press} from '../lib/input/input.js';

const {require, eventually} = checks('cleanup');
const DAY = 24 * 60 * 60;
const SAVED_TIMEOUT = 10000;
const HOUSEKEEPING_TIMEOUT = 4 * 60 * 1000;

const privacy = new Gio.Settings({schema_id: 'org.gnome.desktop.privacy'});
const housekeeping = new Gio.Settings({schema_id: 'com.lantharos.kestrel.housekeeping'});
const pictures = GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES) ?? GLib.get_home_dir();
const trashed = (name: string) => exists(GLib.build_filenamev([GLib.get_user_data_dir(), 'Trash', 'files', name]));

function screenshots() {
  return children(pictures)
    .filter(info => info.get_file_type() === Gio.FileType.DIRECTORY)
    .flatMap(folder => children(GLib.build_filenamev([pictures, folder.get_name()])).map(file => GLib.build_filenamev([pictures, folder.get_name(), file.get_name()])))
    .filter(path => path.endsWith('.png'));
}

function agedCopy(source: string, folder: string, name: string, days: number) {
  GLib.mkdir_with_parents(folder, 0o755);
  const copy = Gio.File.new_for_path(GLib.build_filenamev([folder, name]));
  Gio.File.new_for_path(source).copy(copy, Gio.FileCopyFlags.OVERWRITE, null, null);
  copy.set_attribute_uint64('time::modified', Math.floor(Date.now() / 1000) - days * DAY, Gio.FileQueryInfoFlags.NONE, null);
  return copy.get_path()!;
}

async function takeScreenshot() {
  const before = new Set(screenshots());
  press(Clutter.KEY_Shift_L, Clutter.KEY_Print);
  return eventually(() => screenshots().find(path => !before.has(path)), 'Shift+Print saves a screenshot', SAVED_TIMEOUT);
}

export async function run() {
  require(privacy.get_boolean('remove-old-trash-files'), 'a new account empties old items from the trash');
  require(privacy.get_boolean('remove-old-temp-files'), 'a new account deletes old temporary files');
  require(housekeeping.get_boolean('remove-old-screenshots'), 'a new account moves old screenshots to the trash');
  require(privacy.get_uint('old-files-age') === 30, 'old files go after 30 days in a new account');

  const recent = await takeScreenshot();
  const folder = GLib.path_get_dirname(recent);
  const old = agedCopy(recent, folder, 'Screenshot From 2026-08-01 09-30-00.png', 40);
  const young = agedCopy(recent, folder, 'Screenshot From 2026-10-20 18-05-00.png', 20);
  const kept = agedCopy(recent, GLib.build_filenamev([pictures, 'Holiday']), 'Beach.png', 40);

  await withApp('settings', [], async app => (await showEnd(app, 'privacy')).save('settings-privacy-cleanup-dark'));

  housekeeping.set_boolean('remove-old-screenshots', false);
  housekeeping.reset('remove-old-screenshots');
  await eventually(() => !exists(old), 'a screenshot older than 30 days leaves the screenshots folder', HOUSEKEEPING_TIMEOUT);
  require(trashed(GLib.path_get_basename(old)), 'an old screenshot goes to the trash, not away for good');
  require(exists(young) && exists(recent), 'screenshots younger than 30 days stay');
  require(exists(kept), 'old pictures outside the screenshots folder stay');
}
