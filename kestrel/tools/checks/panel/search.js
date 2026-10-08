import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {press} from '../lib/input.js';
import {scratch} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';

const {eventually} = checks('Start search');
const RECENT_FILE = 'kestrel-quarterly-report.txt';
const HISTORY = GLib.build_filenamev([GLib.get_user_data_dir(), 'recently-used.xbel']);

function rememberRecent(file) {
  file.replace_contents(new TextEncoder().encode('report'), null, false, Gio.FileCreateFlags.NONE, null);
  const history = new GLib.BookmarkFile();
  if (GLib.file_test(HISTORY, GLib.FileTest.EXISTS)) history.load_from_file(HISTORY);
  history.set_mime_type(file.get_uri(), 'text/plain');
  history.add_application(file.get_uri(), 'kestrel-check', 'true %u');
  history.set_modified_date_time(file.get_uri(), GLib.DateTime.new_now_utc());
  history.to_file(HISTORY);
}

function forgetRecent(file) {
  const history = new GLib.BookmarkFile();
  history.load_from_file(HISTORY);
  history.remove_item(file.get_uri());
  history.to_file(HISTORY);
  file.delete(null);
}

async function checkKeyboard(start) {
  press(Clutter.KEY_Down);
  await eventually(() => global.stage.get_key_focus() instanceof St.Button, 'Down in search focuses an app');
  press(Clutter.KEY_Tab);
  await eventually(() => start.contains(global.stage.get_key_focus()), 'Tab stays in Start');
}

async function checkResults(start) {
  const search = start.get_first_child();
  const results = () => start.get_child_at_index(2).child;
  const firstTitle = () => results().get_first_child()?.child.get_children()[1].get_first_child().text;

  search.set_text('2*(3+18)');
  await eventually(() => firstTitle() === '= 42', 'search evaluates calculations');
  search.set_text('bluetooth');
  await eventually(() => results().get_children().some(row => row.name === 'kestrel-search-setting:bluetooth'), 'search finds settings pages');

  const recent = Gio.File.new_for_path(scratch(RECENT_FILE));
  rememberRecent(recent);
  try {
    search.set_text('quarterly');
    await eventually(() => firstTitle() === RECENT_FILE, 'search finds recent files');
    await capture('search-files');
  } finally {
    search.set_text('');
    forgetRecent(recent);
  }
}

export async function run() {
  const start = named('kestrel-start');
  toggleSurface('start');
  await eventually(() => shown(start), 'Start opens');
  await checkKeyboard(start);
  await checkResults(start);
}
