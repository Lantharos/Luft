import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {withApp} from '../apps/lib/apps.js';
import {children} from '../apps/lib/files.js';
import {showEnd} from '../apps/settings/navigation.js';
import {checks} from '../lib/check.js';
import {press} from '../lib/input/input.js';

const {require, eventually} = checks('cleanup');
const SAVED_TIMEOUT = 10000;
const SCREENSHOTS_MARK = 'xattr::luft.screenshots';

const privacy = new Gio.Settings({schema_id: 'org.gnome.desktop.privacy'});
const housekeeping = new Gio.Settings({schema_id: 'com.lantharos.kestrel.housekeeping'});
const pictures = GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES) ?? GLib.get_home_dir();

function screenshots() {
  return children(pictures)
    .filter(info => info.get_file_type() === Gio.FileType.DIRECTORY)
    .flatMap(folder => children(GLib.build_filenamev([pictures, folder.get_name()])).map(file => GLib.build_filenamev([pictures, folder.get_name(), file.get_name()])))
    .filter(path => path.endsWith('.png'));
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
  const folder = Gio.File.new_for_path(GLib.path_get_dirname(recent));
  require(folder.query_info(SCREENSHOTS_MARK, Gio.FileQueryInfoFlags.NONE, null).has_attribute(SCREENSHOTS_MARK), 'it saves into the folder housekeeping clears old screenshots from');

  await withApp('settings', [], async app => (await showEnd(app, 'privacy')).save('settings-privacy-cleanup-dark'));
}
