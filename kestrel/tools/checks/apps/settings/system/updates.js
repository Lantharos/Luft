import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {DOWNLOAD_SIZE} from '../../../../fixtures/system/updater.js';
import {checks} from '../../../lib/check.js';
import {call} from '../../../lib/dbus.js';
import {scroll} from '../../../lib/input/input.js';
import {followLink, openApp} from '../../lib/apps.js';
import {useScheme} from '../../lib/palette.js';

const {require, eventually} = checks('Luft app');
const CHECKS = 'com.lantharos.KestrelChecks';
const DOWNLOAD_TIMEOUT = 45000;
const ACCENT_TOLERANCE = 6;
const DOWNLOAD = [1146, 198];
const HEADER_PROGRESS = {x: 510, y: 130, width: 590, height: 45};
const SIDEBAR = {x: 12, y: 60, width: 256};
const SIDEBAR_POINT = [140, 500];
const SIDEBAR_STEPS = 10;
const FOUND = {update: {release: {version: '45.2', notes: null, released: null}, size: DOWNLOAD_SIZE, layers: ['sha256:4b1d6c0e']}};

function offerUpdate() {
  const folder = GLib.build_filenamev([GLib.get_user_state_dir(), 'com.lantharos.settings']);
  GLib.mkdir_with_parents(folder, 0o700);
  GLib.file_set_contents(GLib.build_filenamev([folder, 'image-update.json']), JSON.stringify(FOUND));
}

class Updates {
  constructor(accent) {
    this.accent = accent;
  }

  async downloads() {
    const reply = await call(CHECKS, '/com/lantharos/KestrelChecks', `${CHECKS}.Calls`, 'Take', null, '(as)', {connection: Gio.DBus.system});
    return reply.deepUnpack()[0].filter(name => name === 'Updater Download').length;
  }

  async open({ready = true} = {}) {
    this.app = await openApp('settings', ['kestrel-settings:system']);
    this.app.window.maximize();
    await eventually(() => this.app.window.is_maximized(), 'settings maximizes');
    if (ready) await this.app.settle(() => true);
  }

  sidebarEnd() {
    for (let step = 0; step < SIDEBAR_STEPS; step++) scroll(Clutter.ScrollDirection.DOWN, this.app.at(SIDEBAR_POINT));
  }

  async progress(area) {
    return (await this.app.frame(this.app.area(area))).count([this.accent], ACCENT_TOLERANCE);
  }
}

async function checkDownload(updates) {
  await updates.open();
  require(await updates.progress(SIDEBAR) === 0, 'the Updates entry shows no progress while nothing runs');
  (await updates.app.frame()).save('settings-updates-available');

  updates.app.click(DOWNLOAD);
  let started = 0;
  await eventually(async () => (started = await updates.progress(HEADER_PROGRESS)) > 0, 'Updates shows the download progress');
  (await updates.app.frame()).save('settings-updates-downloading');

  await followLink('settings', 'kestrel-settings:accounts');
  updates.sidebarEnd();
  await updates.app.settle(() => true);
  let away = 0;
  await eventually(async () => (away = await updates.progress(SIDEBAR)) > 0, 'the Updates entry in the sidebar shows the download on another page');
  (await updates.app.frame()).save('settings-updates-sidebar-progress');
  await eventually(async () => await updates.progress(SIDEBAR) > away, 'the Updates entry in the sidebar shows the download advancing');

  await followLink('settings', 'kestrel-settings:system');
  await eventually(async () => await updates.progress(SIDEBAR) === 0, 'the sidebar leaves the progress to the Updates page while it is open');
  let back = 0;
  await eventually(async () => (back = await updates.progress(HEADER_PROGRESS)) > started, 'coming back to Updates shows the download where it is');
  (await updates.app.frame()).save('settings-updates-back');
  await eventually(async () => await updates.progress(HEADER_PROGRESS) > back, 'the download keeps advancing after coming back to Updates');
  require(await updates.downloads() === 1, 'navigating during the download starts no second download');
  return back;
}

async function checkReopening(updates, back) {
  await updates.app.close();
  await updates.open({ready: false});
  await eventually(async () => await updates.progress(HEADER_PROGRESS) > back, 'reopening Settings picks up the running download');
  (await updates.app.frame()).save('settings-updates-reopened');
  require(await updates.downloads() === 0, 'reopening Settings during the download starts no second download');
  await eventually(async () => await updates.progress(HEADER_PROGRESS) === 0, 'the download finishes', DOWNLOAD_TIMEOUT);
  (await updates.app.settle(() => true)).save('settings-updates-ready');
}

export async function checkUpdates(palette) {
  useScheme('dark');
  offerUpdate();
  const updates = new Updates(palette.dark.primary);
  try {
    await updates.downloads();
    await checkReopening(updates, await checkDownload(updates));
  } finally {
    await updates.app?.close();
  }
}
