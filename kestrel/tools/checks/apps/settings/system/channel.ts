import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {checks} from '../../../lib/check.js';
import {call} from '../../../lib/dbus.js';
import type {Point} from '../../../lib/input/input.js';
import type {Frame} from '../../../lib/screenshots.js';
import {scratch} from '../../../lib/processes.js';
import {changes, withApp} from '../../lib/apps.js';

const {require, eventually} = checks('Luft app');
const CHECKS = 'com.lantharos.KestrelChecks';
const SWITCH: Point = [1151, 470];
const CHANNEL = {x: 507, y: 400, width: 600, height: 110};
const CONFIRM_STABLE: Point = [844, 514];
const CONFIRM_NIGHTLY: Point = [844, 503];
const CANCEL_NIGHTLY: Point = [732, 503];
const CONFIRM_STAY: Point = [844, 482];

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

async function switchTo(app: LuftApp, channel: string, confirm: Point, name: string) {
  (await changes(app, `switching to ${channel} asks to confirm first`, () => app.click(SWITCH))).save(`settings-channel-confirm-${name}`);
  require((await switchesAsked()).length === 0, 'the updater, which asks for an administrator, isn’t reached before confirming');
  app.click(confirm);
  await eventually(async () => (await switchesAsked()).includes(`Updater SwitchChannel ${channel}`), `confirming asks the updater to switch to ${channel}`);
  await app.settle(() => true);
}

async function checkUnknown() {
  await onUpdates('nightly', 'unknown', async app => {
    (await app.frame()).save('settings-channel-unknown');
    const shown = await app.frame(app.area(CHANNEL));
    app.click(SWITCH);
    require((await app.settle(() => true, app.area(CHANNEL))).looksLike(shown), 'Switch can’t be pressed while it’s unknown whether a stable version is out');
  });
  require((await switchesAsked()).length === 0, 'nothing asks the updater to switch while stable can’t be chosen');
}

async function stays(app: LuftApp, channel: string, shown: Frame) {
  await switchTo(app, channel, CONFIRM_STAY, `stay-${channel}`);
  const after = await app.settle(frame => frame.looksLike(shown, 2), app.area(CHANNEL));
  require(after.looksLike(shown, 2), `staying on ${channel} shows it as it was before the move`);
}

async function switchToStable(stable: Published, name: string) {
  await onUpdates('nightly', stable, async app => {
    (await app.frame()).save(`settings-channel-nightly-${name}`);
    const nightly = await app.frame(app.area(CHANNEL));
    await switchTo(app, 'stable', CONFIRM_STABLE, `stable-${name}`);
    (await app.frame()).save(`settings-channel-waiting-stable-${name}`);
    if (stable === 'yes') await stays(app, 'nightly', nightly);
  });
}

async function checkToNightly() {
  await onUpdates('stable', 'yes', async app => {
    (await app.frame()).save('settings-channel-stable');
    const before = await app.frame(app.area(CHANNEL));
    (await changes(app, 'switching to nightly shows the confirmation first', () => app.click(SWITCH))).save('settings-channel-confirm-nightly');
    require((await switchesAsked()).length === 0, 'the updater isn’t reached while the nightly confirmation is open');
    app.click(CANCEL_NIGHTLY);
    const after = await app.settle(frame => frame.looksLike(before, 2), app.area(CHANNEL));
    require(after.looksLike(before, 2), 'Cancel closes the confirmation and leaves the channel as it was');
    require((await switchesAsked()).length === 0, 'Cancel changes nothing');
    await switchTo(app, 'nightly', CONFIRM_NIGHTLY, 'nightly-confirmed');
    (await app.frame()).save('settings-channel-waiting-nightly');
    await stays(app, 'stable', before);
  });
}

export async function checkChannel() {
  await switchesAsked();
  try {
    await checkUnknown();
    await switchToStable('no', 'none-out');
    await switchToStable('yes', 'out');
    await checkToNightly();
  } finally {
    await useChannel('', 'no');
  }
}
