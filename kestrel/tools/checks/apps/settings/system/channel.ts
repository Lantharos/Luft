import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {checks} from '../../../lib/check.js';
import {call} from '../../../lib/dbus.js';
import type {Point} from '../../../lib/input/input.js';
import {scratch} from '../../../lib/processes.js';
import {changes, withApp} from '../../lib/apps.js';

const {require, eventually} = checks('Luft app');
const CHECKS = 'com.lantharos.KestrelChecks';
const SWITCH_STABLE: Point = [1151, 470];
const SWITCH_NIGHTLY: Point = [1151, 539];
const CHANNELS = {x: 507, y: 400, width: 700, height: 180};
const CONFIRM_STABLE: Point = [844, 514];
const CANCEL_NIGHTLY: Point = [732, 503];

type Published = 'yes' | 'no' | 'unknown';

function useChannel(followed: string, stable: Published) {
  return call(CHECKS, '/com/lantharos/KestrelChecks/Updater', `${CHECKS}.Updater`, 'UseChannel',
    new GLib.Variant('(ss)', [followed, stable]), null, {connection: Gio.DBus.system});
}

async function switchesAsked() {
  const reply = await call(CHECKS, '/com/lantharos/KestrelChecks', `${CHECKS}.Calls`, 'Take', null, '(as)', {connection: Gio.DBus.system});
  return reply.deepUnpack()[0].filter(name => name.startsWith('Updater SwitchChannel'));
}

async function onUpdates(followed: string, stable: Published, use: (app: LuftApp) => Promise<void>) {
  await useChannel(followed, stable);
  const noGraphics = scratch('channel-pci');
  GLib.mkdir_with_parents(noGraphics, 0o700);
  await withApp('settings', ['kestrel-settings:system'], async app => {
    app.window.maximize();
    await eventually(() => app.window.is_maximized(), 'settings maximizes');
    await app.settle(() => true);
    await use(app);
  }, {LUFT_PCI_DEVICES: noGraphics});
}

async function checkNoStable() {
  await onUpdates('nightly', 'no', async app => {
    (await app.frame()).save('settings-channel-no-stable');
    const shown = await app.frame(app.area(CHANNELS));
    app.click(SWITCH_STABLE);
    require((await app.settle(() => true, app.area(CHANNELS))).looksLike(shown), 'Stable can’t be chosen while no stable version is out');
  });
  await onUpdates('nightly', 'unknown', async app => {
    (await app.frame()).save('settings-channel-unknown');
  });
  require((await switchesAsked()).length === 0, 'nothing asks the updater to switch while stable can’t be chosen');
}

async function checkToStable() {
  await onUpdates('nightly', 'yes', async app => {
    (await app.frame()).save('settings-channel-nightly');
    (await changes(app, 'switching to stable asks to confirm first', () => app.click(SWITCH_STABLE))).save('settings-channel-confirm-stable');
    require((await switchesAsked()).length === 0, 'the updater, which asks for an administrator, isn’t reached before confirming');
    app.click(CONFIRM_STABLE);
    await eventually(async () => (await switchesAsked()).includes('Updater SwitchChannel stable'), 'confirming asks the updater to switch to stable');
    await app.settle(() => true);
    (await app.frame()).save('settings-channel-waiting-stable');
  });
}

async function checkToNightly() {
  await onUpdates('stable', 'yes', async app => {
    (await app.frame()).save('settings-channel-stable');
    const before = await app.frame(app.area(CHANNELS));
    (await changes(app, 'switching to nightly shows the confirmation first', () => app.click(SWITCH_NIGHTLY))).save('settings-channel-confirm-nightly');
    require((await switchesAsked()).length === 0, 'the updater isn’t reached while the nightly confirmation is open');
    app.click(CANCEL_NIGHTLY);
    const after = await app.settle(frame => frame.looksLike(before), app.area(CHANNELS));
    require(after.looksLike(before), 'Cancel closes the confirmation and leaves the channel as it was');
    require((await switchesAsked()).length === 0, 'Cancel changes nothing');
  });
}

export async function checkChannel() {
  await switchesAsked();
  try {
    await checkNoStable();
    await checkToStable();
    await checkToNightly();
  } finally {
    await useChannel('', 'no');
  }
}
