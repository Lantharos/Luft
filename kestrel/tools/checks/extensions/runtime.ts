import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {Main, QuickMenuToggle} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, named, ofType} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {capture} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {closeStart, groupTitles, openStart, rows, search, titleOf} from '../start/search/results.js';
import {copyFolder, install, layerSheets, listed, RAIN, request, rewrite, setSetting, systemFolder, userFolder} from './lib/extensions.js';

const {require, eventually} = checks('extensions');
const PROBE = 'com.example.Probe';
const BROKEN = 'com.example.Broken';
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

interface ProbeState {
  version: string;
  ticks: number;
  disabled: boolean;
}

const probe = () => (globalThis as {probe?: ProbeState}).probe ?? null;
const probeLoads = () => (globalThis as {probeLoads?: number}).probeLoads ?? 0;
const taskbarItem = () => descendants(named('kestrel-extension-items')!).find(actor => actor.accessible_name === 'Probe' && actor.mapped) ?? null;
const probeTile = () => descendants(named('kestrel-quick-settings')!).find(actor => actor instanceof QuickMenuToggle && actor.title === 'Probe') ?? null;
const notified = (title: string) => Main.messageTray.getSources().some(source => source.notifications.some(notification => notification.title === title));

async function checkRain() {
  const rain = await eventually(() => listed(RAIN), 'Rain ships with Luft and is listed');
  require(rain.origin === 'system' && rain.state === 'running' && rain.version === '1.0.0', 'Rain runs from the system copy');
  require(layerSheets(RAIN).length === 0, 'Rain draws nothing while it is off: its layer has no actors');
}

async function checkDisabledCostsNothing() {
  await request('Disable', PROBE);
  install('probe', PROBE);
  await request('Reload', PROBE);
  const off = await eventually(() => listed(PROBE), 'a newly installed extension is listed after Reload');
  require(off.state === 'off' && !off.enabled, 'an extension turned off before it was installed stays off');
  await pause(200);
  require(probeLoads() === 0 && !probe() && !taskbarItem(), 'a turned off extension never loads its code');
}

async function checkEnabled() {
  await request('Enable', PROBE);
  await eventually(() => taskbarItem(), 'turning it on adds its taskbar item');
  await eventually(() => probeTile(), 'and its quick settings toggle');
  require(probe()!.version === '1.0.0' && probeLoads() === 1, 'its module loaded once');
  await eventually(() => probe()!.ticks > 2, 'its timers run');
  ofType(taskbarItem(), St.Button).emit('clicked', 1);
  await eventually(() => notified('Hello from the probe'), 'it sends notifications');

  await setSetting(PROBE, 'on', new GLib.Variant('b', true));
  await eventually(() => (probeTile() as InstanceType<typeof QuickMenuToggle>).checked, 'a setting changed over D-Bus reaches its toggle');
  const refused = await setSetting(PROBE, 'mood', new GLib.Variant('s', 'grumpy')).then(() => false, () => true);
  require(refused, 'a value the manifest does not offer is refused');

  await openStart();
  search('needle');
  await eventually(() => groupTitles().includes('Probe') && rows().some(row => titleOf(row) === 'Probe found needle'), 'its results show in Start search');
  closeStart();
}

async function checkDisabledCleansUp() {
  await request('Disable', PROBE);
  await eventually(() => !taskbarItem() && !probeTile(), 'turning it off takes its taskbar item and toggle away');
  require(probe()!.disabled, 'and runs its own cleanup');
  const ticks = probe()!.ticks;
  await pause(200);
  require(probe()!.ticks === ticks, 'its timers stop with it');
}

async function checkReload() {
  await request('Enable', PROBE);
  await eventually(() => taskbarItem(), 'the probe runs again');
  const folder = userFolder(PROBE);
  rewrite(`${folder}/extension.toml`, text => text.replace('version = "1.0.0"', 'version = "1.1.0"'));
  rewrite(`${folder}/extension.js`, text => text.replace('version: probe.version', "version: `${probe.version} new`"));
  await request('Reload', PROBE);
  await eventually(async () => (await listed(PROBE))?.version === '1.1.0', 'Reload picks up the new manifest');
  await eventually(() => probe()?.version === '1.1.0 new', 'and runs the new code, not the module loaded before');
  require(descendants(named('kestrel-extension-items')!).filter(actor => actor.accessible_name === 'Probe').length === 1, 'the old version left nothing behind');
}

async function checkThrowing() {
  install('broken', BROKEN);
  await request('Reload', BROKEN);
  await eventually(async () => (await listed(BROKEN))?.state === 'failed', 'an extension that throws on enable is switched off');
  const broken = (await listed(BROKEN))!;
  require(!broken.enabled && broken.problem.includes('breaks on purpose'), 'and Settings can say why');
  require(!descendants(named('kestrel-extension-items')!).some(actor => actor.accessible_name === 'Broken'), 'what it made before it threw is gone');
  await eventually(() => notified('Broken was turned off'), 'the person is told');
  await capture('extension-turned-off');
}

async function checkUserCopyOverrides() {
  copyFolder(Gio.File.new_for_path(systemFolder(RAIN)), Gio.File.new_for_path(userFolder(RAIN)));
  rewrite(`${userFolder(RAIN)}/extension.toml`, text => text.replace('version = "1.0.0"', 'version = "9.0.0"'));
  await request('Reload', RAIN);
  await eventually(async () => {
    const rain = await listed(RAIN);
    return rain?.origin === 'user' && rain.overrides && rain.version === '9.0.0' && rain.state === 'running';
  }, 'a user copy replaces the system copy, as a store update would');
  await request('Remove', RAIN);
  await eventually(async () => !await listed(RAIN), 'removing it takes Rain away for this account');
  require(!GLib.file_test(userFolder(RAIN), GLib.FileTest.EXISTS), 'and deletes the user copy');
  kestrel.reset('removed-extensions');
  await eventually(async () => (await listed(RAIN))?.origin === 'system', 'the system copy comes back once it is no longer removed');
}

export async function run() {
  try {
    await checkRain();
    await checkDisabledCostsNothing();
    await checkEnabled();
    await checkDisabledCleansUp();
    await checkReload();
    await checkThrowing();
    await checkUserCopyOverrides();
  } finally {
    for (const id of [PROBE, BROKEN]) await request('Remove', id);
    for (const key of ['disabled-extensions', 'removed-extensions', 'extension-settings', 'extension-problems']) kestrel.reset(key);
  }
}
