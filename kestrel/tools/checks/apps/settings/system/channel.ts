import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {checks} from '../../../lib/check.js';
import {call} from '../../../lib/dbus.js';
import type {Frame} from '../../../lib/screenshots.js';
import {scratch} from '../../../lib/processes.js';
import {changes, withApp} from '../../lib/apps.js';

const {require, eventually} = checks('Luft app');
const CHECKS = 'com.lantharos.KestrelChecks';
const SWITCH = {role: 'button', name: 'Switch'};
const CHANNEL = {x: 507, y: 455, width: 600, height: 130};

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

async function switchTo(app: LuftApp, channel: string, confirm: string, name: string) {
  (await changes(app, `switching to ${channel} asks to confirm first`, async () => app.click(await app.find(SWITCH)))).save(`settings-channel-confirm-${name}`);
  require((await switchesAsked()).length === 0, 'the updater, which asks for an administrator, isn’t reached before confirming');
  app.click(await app.find({role: 'button', name: confirm}));
  await eventually(async () => (await switchesAsked()).includes(`Updater SwitchChannel ${channel}`), `confirming asks the updater to switch to ${channel}`);
  await app.settle(() => true);
}

async function checkStableCantBeChosen(stable: Published, name: string) {
  await onUpdates('nightly', stable, async app => {
    (await app.frame()).save(`settings-channel-${name}`);
    const shown = await app.frame(app.area(CHANNEL));
    for (const offered of await app.all(SWITCH)) app.click(offered);
    require((await app.settle(() => true, app.area(CHANNEL))).looksLike(shown), `nothing switches to stable while it’s ${name}`);
  });
  require((await switchesAsked()).length === 0, `nothing asks the updater to switch while stable is ${name}`);
}

async function stays(app: LuftApp, channel: string, shown: Frame) {
  await switchTo(app, channel, `Stay on ${channel}`, `stay-${channel}`);
  const after = await app.settle(frame => frame.looksLike(shown, 2), app.area(CHANNEL));
  require(after.looksLike(shown, 2), `staying on ${channel} shows it as it was before the move`);
}

async function switchToStable() {
  await onUpdates('nightly', 'yes', async app => {
    (await app.frame()).save('settings-channel-nightly-out');
    const nightly = await app.frame(app.area(CHANNEL));
    await switchTo(app, 'stable', 'Switch to stable', 'stable-out');
    (await app.frame()).save('settings-channel-waiting-stable-out');
    await stays(app, 'nightly', nightly);
  });
}

async function checkToNightly() {
  await onUpdates('stable', 'yes', async app => {
    (await app.frame()).save('settings-channel-stable');
    const before = await app.frame(app.area(CHANNEL));
    (await changes(app, 'switching to nightly shows the confirmation first', async () => app.click(await app.find(SWITCH)))).save('settings-channel-confirm-nightly');
    require((await switchesAsked()).length === 0, 'the updater isn’t reached while the nightly confirmation is open');
    app.click(await app.find({role: 'button', name: 'Cancel'}));
    const after = await app.settle(frame => frame.looksLike(before, 2), app.area(CHANNEL));
    require(after.looksLike(before, 2), 'Cancel closes the confirmation and leaves the channel as it was');
    require((await switchesAsked()).length === 0, 'Cancel changes nothing');
    await switchTo(app, 'nightly', 'Switch to nightly', 'nightly-confirmed');
    (await app.frame()).save('settings-channel-waiting-nightly');
    await stays(app, 'stable', before);
  });
}

export async function checkChannel() {
  await switchesAsked();
  try {
    await checkStableCantBeChosen('unknown', 'unknown');
    await checkStableCantBeChosen('no', 'not out yet');
    await switchToStable();
    await checkToNightly();
  } finally {
    await useChannel('', 'no');
  }
}
