import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {labelled, named} from '../lib/actors.js';
import {resetBattery, setBattery} from '../lib/battery.js';
import {sabineService} from '../lib/apps/luftApp.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {press, rightClick} from '../lib/input/input.js';
import {findWindow, scratch, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled, waitUntil} from '../lib/wait.js';
import {bestTitle, closeStart, descriptionOf, groupTitles, openStart, row, search, withHandler} from './search/results.js';

const {require, eventually} = checks('Start file search');
const HOME = GLib.get_home_dir();
const FOLDER = GLib.build_filenamev([HOME, 'Documents', 'Search check']);
const PLANS = GLib.build_filenamev([FOLDER, 'Harbor plans.txt']);
const FERRIES = GLib.build_filenamev([FOLDER, 'Timetables', 'Ferry times.md']);
const UNPLUGGED = GLib.build_filenamev([FOLDER, 'Written unplugged.txt']);
const BACKUP = GLib.build_filenamev([FOLDER, 'Settings backup.txt']);
const RECENT = scratch('kestrel-quarterly-report.txt');
const HISTORY = GLib.build_filenamev([GLib.get_user_data_dir(), 'recently-used.xbel']);
const SECOND_APP = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications', 'com.lantharos.SearchCheckPrinters.desktop']);
const INDEX_TIMEOUT = 20000;
const REVEAL_TIMEOUT = 30000;

const uri = (path: string) => GLib.filename_to_uri(path, null);
const indexer = <S extends string>(method: string, parameters: GLib.Variant | null, reply: S | null) => call('com.lantharos.Search', '/com/lantharos/Search', 'com.lantharos.Search', method, parameters, reply);
const withName = async (query: string) => (await indexer('Find', new GLib.Variant('(su)', [query, 10]), '(a(sbd))')).deepUnpack()[0].map(([path]) => path);
const mentioning = async (query: string) => (await indexer('FindText', new GLib.Variant('(su)', [query, 10]), '(a(ss))')).deepUnpack()[0].map(([path]) => path);

function write(path: string, text: string) {
  GLib.mkdir_with_parents(GLib.path_get_dirname(path), 0o755);
  GLib.file_set_contents(path, text);
}

function removeTree(path: string) {
  const file = Gio.File.new_for_path(path);
  if (file.query_file_type(Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null) === Gio.FileType.DIRECTORY) {
    for (const info of file.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null))
      removeTree(GLib.build_filenamev([path, info.get_name()]));
  }
  file.delete(null);
}

async function indexed(condition: () => Promise<boolean>, label: string) {
  await eventually(async () => {
    await indexer('Refresh', null, null);
    return condition();
  }, label, INDEX_TIMEOUT);
}

function remember(path: string) {
  write(path, 'report');
  const history = new GLib.BookmarkFile();
  if (GLib.file_test(HISTORY, GLib.FileTest.EXISTS)) history.load_from_file(HISTORY);
  history.set_mime_type(uri(path), 'text/plain');
  history.add_application(uri(path), 'kestrel-check', 'true %u');
  history.set_modified_date_time(uri(path), GLib.DateTime.new_now_utc());
  history.to_file(HISTORY);
}

function forget(path: string) {
  const history = new GLib.BookmarkFile();
  history.load_from_file(HISTORY);
  history.remove_item(uri(path));
  history.to_file(HISTORY);
  GLib.unlink(path);
}

async function checkRecent() {
  remember(RECENT);
  try {
    await openStart();
    search('quarterly');
    await eventually(() => bestTitle() === 'kestrel-quarterly-report.txt', 'search finds recent files');
  } finally {
    closeStart();
    forget(RECENT);
  }
}

async function checkNames() {
  await indexed(async () => (await withName('ferry times')).includes(FERRIES), 'the index picks up new files');
  await openStart();
  search('harbor plans');
  await eventually(() => row(`file:${uri(PLANS)}`), 'search finds files by name');
  require(descriptionOf(row(`file:${uri(PLANS)}`)!) === '~/Documents/Search check', 'file results name their folder');
  search('timetables ferry');
  await eventually(() => bestTitle() === 'Ferry times.md', 'a folder name narrows file results');
  search('timetables');
  await eventually(() => row(`file:${uri(GLib.path_get_dirname(FERRIES))}`), 'search finds folders');
  search('settings backup');
  await eventually(() => row(`file:${uri(BACKUP)}`), 'the index finds a file that shares a name with an app');
  write(SECOND_APP, '[Desktop Entry]\nType=Application\nName=Printer Settings\nExec=true\nIcon=printer\n');
  try {
    search('settings');
    await eventually(() => {
      const titles = groupTitles();
      return titles[0] === 'Best match' && titles.includes('Apps') && titles.includes('Files');
    }, 'mixed results come in groups under the best match');
    require(groupTitles().indexOf('Apps') < groupTitles().indexOf('Files'), 'apps come before files');
    await capture('search-files');
  } finally {
    GLib.unlink(SECOND_APP);
  }

  await withHandler('text/plain', 'Text Check', async opened => {
    search('harbor plans');
    await eventually(() => bestTitle() === 'Harbor plans.txt', 'the named file is the best match');
    press(Clutter.KEY_Return);
    await eventually(() => opened().includes(PLANS), 'Enter opens the file');
  });
  await openStart();
  search('harbor plans');
  await eventually(() => bestTitle() === 'Harbor plans.txt', 'the file is found again');
  await settled();
  rightClick(row(`file:${uri(PLANS)}`)!);
  const menu = named('kestrel-context-menu')!;
  await eventually(() => menu.visible && labelled('Show in Rover', menu)?.mapped, 'a file result offers to show it in Rover');
  press(Clutter.KEY_Escape);
  await eventually(() => !menu.visible, 'Escape closes the file menu');
  await sabineService();
  press(Clutter.KEY_Control_L, Clutter.KEY_Return);
  const rover = await waitForWindow(window => window.get_wm_class() === 'com.lantharos.rover', 'Ctrl+Enter shows the file in Rover', REVEAL_TIMEOUT);
  rover.delete(global.get_current_time());
  await eventually(() => !findWindow(window => window === rover), 'Rover closes');
}

async function checkContents() {
  await indexed(async () => (await mentioning('zephyrine')).includes(PLANS), 'the index reads text files');
  await openStart();
  search('zephyrine');
  await eventually(() => row(`file:${uri(PLANS)}`), 'search finds words inside files');
  require(descriptionOf(row(`file:${uri(PLANS)}`)!).includes('zephyrine tide tables'), 'a match inside a file shows the line it is on');
  await capture('search-contents');
  closeStart();

  await setBattery({OnBattery: true});
  try {
    write(UNPLUGGED, 'The marram grass holds the dunes.');
    await indexed(async () => (await withName('written unplugged')).includes(UNPLUGGED), 'names stay current on battery');
    require(!(await mentioning('marram')).includes(UNPLUGGED), 'reading file contents waits while on battery');
  } finally {
    await resetBattery();
  }
  await waitUntil(async () => (await mentioning('marram')).includes(UNPLUGGED), 'contents are read once plugged in', INDEX_TIMEOUT);
}

export async function run() {
  write(PLANS, 'Notes for the spring\nThe zephyrine tide tables for the harbor, checked every morning.\n');
  write(FERRIES, '# Ferries\n\nThe first ferry leaves the quay at seven.\n');
  write(BACKUP, 'Exported before the update.\n');
  try {
    await checkRecent();
    await checkNames();
    await checkContents();
  } finally {
    search('');
    closeStart();
    removeTree(FOLDER);
  }
}
