import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {LuftApp, sleep, waitFor} from './luftApp.js';

const CHECKS = 'com.lantharos.KestrelChecks';
const PACKAGEKIT = 'org.freedesktop.PackageKit';
const LOADING = 800;
const NAVIGATION = 300;
const ADVANCE = 1500;
const DOWNLOAD_TIMEOUT = 25000;
const ACCENT_TOLERANCE = 6;
const DOWNLOAD = [1146, 198];
const LINK_TIMEOUT = 5000;
const HEADER_PROGRESS = {x: 510, y: 130, width: 590, height: 45};
const SIDEBAR = {x: 12, y: 60, width: 256};
const LOOKS = ['refresh', 'updates'].map(role => `PackageKit ${role}`);
const UPDATE_IDS = ['kernel;6.17.4-300.fc45;x86_64;updates', 'systemd;258.2-1.fc45;x86_64;updates'];

function systemBus() {
  return Gio.DBusConnection.new_for_address_sync(GLib.getenv('KESTREL_SYSTEM_BUS'),
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
}

function call(bus, name, path, method, parameters, replyType = null) {
  return bus.call_sync(name, path, method.slice(0, method.lastIndexOf('.')), method.slice(method.lastIndexOf('.') + 1),
    parameters, replyType && new GLib.VariantType(replyType), Gio.DBusCallFlags.NONE, -1, null)?.deepUnpack();
}

function installElsewhere(bus) {
  const [path] = call(bus, PACKAGEKIT, '/org/freedesktop/PackageKit', `${PACKAGEKIT}.CreateTransaction`, null, '(o)');
  call(bus, PACKAGEKIT, path, `${PACKAGEKIT}.Transaction.UpdatePackages`, new GLib.Variant('(tas)', [0, UPDATE_IDS]));
}

function press(app, pointer, [x, y]) {
  const frame = app.window.get_frame_rect();
  pointer.notify_absolute_motion(GLib.get_monotonic_time(), frame.x + x, frame.y + y);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
}

function region(app, {x, y, width, height}) {
  const frame = app.window.get_frame_rect();
  return {x: frame.x + x, y: frame.y + y, width, height: height ?? frame.height - y};
}

async function open(page) {
  await new LuftApp('settings', [`kestrel-settings:${page}`]).finished(LINK_TIMEOUT);
  await sleep(NAVIGATION);
}

export async function checkSettingsUpdates({palette, styles, pointer, require, output}) {
  styles.interface.set_string('color-scheme', 'prefer-dark');
  const accent = palette.dark.primary;
  const bus = systemBus();
  const takeCalls = () => call(bus, CHECKS, '/com/lantharos/KestrelChecks', `${CHECKS}.Calls.Take`, null, '(as)')[0];
  const progress = async area => (await app.frame(region(app, area))).count([accent], ACCENT_TOLERANCE);
  const looked = calls => calls.filter(name => LOOKS.includes(name));
  takeCalls();

  let app = null;
  const openUpdates = async () => {
    app = new LuftApp('settings', ['kestrel-settings:updates']);
    await app.open();
    app.window.maximize();
    await sleep(LOADING);
  };
  try {
    await openUpdates();
    await app.settle(() => true);
    require(looked(takeCalls()).length === 1, 'settings looks for system updates once when Updates opens');
    require(await progress(SIDEBAR) === 0, 'the Updates entry shows no progress while nothing runs');

    press(app, pointer, DOWNLOAD);
    await sleep(LOADING);
    const started = await progress(HEADER_PROGRESS);
    (await app.frame()).save(`${output}/settings-updates-downloading.png`);
    require(started > 0, 'Updates shows the download progress');

    await open('about');
    const away = await progress(SIDEBAR);
    (await app.frame()).save(`${output}/settings-updates-sidebar-progress.png`);
    await sleep(ADVANCE);
    const awayLater = await progress(SIDEBAR);
    require(away > 0 && awayLater > away, 'the Updates entry in the sidebar shows the download advancing on another page');

    await open('updates');
    const back = await progress(HEADER_PROGRESS);
    (await app.frame()).save(`${output}/settings-updates-back.png`);
    require(back > started, 'coming back to Updates shows the download where it is instead of looking for updates again');
    await sleep(ADVANCE);
    require(await progress(HEADER_PROGRESS) > back, 'the download keeps advancing after coming back to Updates');
    require(await progress(SIDEBAR) === 0, 'the sidebar leaves the progress to the Updates page while it is open');

    const calls = takeCalls();
    require(calls.includes('PackageKit update') && !looked(calls).length, 'navigating during the download starts no second check');

    await app.close();
    await openUpdates();
    const reopened = await progress(HEADER_PROGRESS);
    (await app.frame()).save(`${output}/settings-updates-reopened.png`);
    require(reopened > back, 'reopening Settings picks up the running download');
    const reopenCalls = takeCalls();
    require(!reopenCalls.includes('PackageKit update') && !reopenCalls.includes('PackageKit refresh'),
      'reopening Settings during the download starts no second download or check');

    await waitFor(async () => await progress(HEADER_PROGRESS) === 0, DOWNLOAD_TIMEOUT, () => 'the download never finished');
    (await app.settle(() => true)).save(`${output}/settings-updates-ready.png`);
    takeCalls();

    installElsewhere(bus);
    await waitFor(async () => await progress(HEADER_PROGRESS) > 0, 5000, () => 'Updates ignored updates installed by another app');
    (await app.frame()).save(`${output}/settings-updates-elsewhere.png`);
    await waitFor(async () => await progress(HEADER_PROGRESS) === 0, DOWNLOAD_TIMEOUT, () => 'the other app never finished installing');
    require(looked(takeCalls()).length === 1, 'Updates follows updates installed by another app, then looks again once');
  } finally {
    await app?.close();
  }
}
