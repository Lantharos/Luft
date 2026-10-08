import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../../lib/check.js';
import {call} from '../../lib/dbus.js';
import {followLink, openApp} from '../lib/apps.js';
import {useScheme} from '../lib/palette.js';

const {require, eventually} = checks('Luft app');
const CHECKS = 'com.lantharos.KestrelChecks';
const PACKAGEKIT = 'org.freedesktop.PackageKit';
const DOWNLOAD_TIMEOUT = 25000;
const NOTICE_TIMEOUT = 10000;
const ACCENT_TOLERANCE = 6;
const DOWNLOAD = [1146, 198];
const HEADER_PROGRESS = {x: 510, y: 130, width: 590, height: 45};
const SIDEBAR = {x: 12, y: 60, width: 256};
const LOOKS = ['refresh', 'updates'].map(role => `PackageKit ${role}`);
const UPDATE_IDS = ['kernel;6.17.4-300.fc45;x86_64;updates', 'systemd;258.2-1.fc45;x86_64;updates'];

function systemBus() {
  return Gio.DBusConnection.new_for_address_sync(GLib.getenv('KESTREL_SYSTEM_BUS'),
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
}

class Updates {
  constructor(accent) {
    this.accent = accent;
    this.bus = systemBus();
    this.seen = [];
  }

  async take() {
    const reply = await call(CHECKS, '/com/lantharos/KestrelChecks', `${CHECKS}.Calls`, 'Take', null, '(as)', {connection: this.bus});
    this.seen.push(...reply.deepUnpack()[0]);
    return this.seen;
  }

  async calls() {
    await this.take();
    return this.seen.splice(0);
  }

  async looks() {
    return (await this.take()).filter(name => LOOKS.includes(name)).length;
  }

  async open({ready = true} = {}) {
    this.app = await openApp('settings', ['kestrel-settings:updates']);
    this.app.window.maximize();
    await eventually(() => this.app.window.is_maximized(), 'settings maximizes');
    if (ready) await this.app.settle(() => true);
  }

  async progress(area) {
    return (await this.app.frame(this.app.area(area))).count([this.accent], ACCENT_TOLERANCE);
  }

  async installElsewhere() {
    const [path] = (await call(PACKAGEKIT, '/org/freedesktop/PackageKit', PACKAGEKIT, 'CreateTransaction', null, '(o)', {connection: this.bus})).deepUnpack();
    await call(PACKAGEKIT, path, `${PACKAGEKIT}.Transaction`, 'UpdatePackages', new GLib.Variant('(tas)', [0, UPDATE_IDS]), null, {connection: this.bus});
  }
}

async function checkDownload(updates) {
  await updates.open();
  await eventually(async () => await updates.looks() === 1, 'settings looks for system updates once when Updates opens');
  await updates.calls();
  require(await updates.progress(SIDEBAR) === 0, 'the Updates entry shows no progress while nothing runs');

  updates.app.click(DOWNLOAD);
  let started = 0;
  await eventually(async () => (started = await updates.progress(HEADER_PROGRESS)) > 0, 'Updates shows the download progress');
  (await updates.app.frame()).save('settings-updates-downloading');

  await followLink('settings', 'kestrel-settings:about');
  let away = 0;
  await eventually(async () => (away = await updates.progress(SIDEBAR)) > 0, 'the Updates entry in the sidebar shows the download on another page');
  (await updates.app.frame()).save('settings-updates-sidebar-progress');
  await eventually(async () => await updates.progress(SIDEBAR) > away, 'the Updates entry in the sidebar shows the download advancing');

  await followLink('settings', 'kestrel-settings:updates');
  await eventually(async () => await updates.progress(SIDEBAR) === 0, 'the sidebar leaves the progress to the Updates page while it is open');
  let back = 0;
  await eventually(async () => (back = await updates.progress(HEADER_PROGRESS)) > started,
    'coming back to Updates shows the download where it is instead of looking for updates again');
  (await updates.app.frame()).save('settings-updates-back');
  await eventually(async () => await updates.progress(HEADER_PROGRESS) > back, 'the download keeps advancing after coming back to Updates');
  const calls = await updates.calls();
  require(calls.includes('PackageKit update') && !calls.some(name => LOOKS.includes(name)), 'navigating during the download starts no second check');
  return back;
}

async function checkReopening(updates, back) {
  await updates.app.close();
  await updates.open({ready: false});
  await eventually(async () => await updates.progress(HEADER_PROGRESS) > back, 'reopening Settings picks up the running download');
  (await updates.app.frame()).save('settings-updates-reopened');
  const calls = await updates.calls();
  require(!calls.includes('PackageKit update') && !calls.includes('PackageKit refresh'), 'reopening Settings during the download starts no second download or check');
  await eventually(async () => await updates.progress(HEADER_PROGRESS) === 0, 'the download finishes', DOWNLOAD_TIMEOUT);
  (await updates.app.settle(() => true)).save('settings-updates-ready');
}

async function checkInstalledElsewhere(updates) {
  await updates.calls();
  await updates.installElsewhere();
  await eventually(async () => await updates.progress(HEADER_PROGRESS) > 0, 'Updates follows updates installed by another app', NOTICE_TIMEOUT);
  (await updates.app.frame()).save('settings-updates-elsewhere');
  await eventually(async () => await updates.progress(HEADER_PROGRESS) === 0, 'the other app finishes installing', DOWNLOAD_TIMEOUT);
  await eventually(async () => await updates.looks() === 1, 'Updates looks again once after another app installed updates');
}

export async function checkUpdates(palette) {
  useScheme('dark');
  const updates = new Updates(palette.dark.primary);
  try {
    await updates.calls();
    await checkReopening(updates, await checkDownload(updates));
    await checkInstalledElsewhere(updates);
  } finally {
    await updates.app?.close();
    updates.bus.close_sync(null);
  }
}
