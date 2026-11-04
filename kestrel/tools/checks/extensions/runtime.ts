import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {Main, QuickMenuToggle} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, named, ofType} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {capture} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {closeStart, groupTitles, openStart, rows, search, titleOf} from '../start/search/results.js';
import {copyFolder, install, layerSheets, listed, request, rewrite, SEASONS, setSetting, userFolder} from './lib/extensions.js';

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

async function checkSeasons() {
  const seasons = await eventually(() => listed(SEASONS), 'Seasons is preinstalled for a new account and listed');
  require(seasons.state === 'running' && seasons.version === '1.0.0', 'Seasons runs from the copy in the account');
  require(layerSheets(SEASONS).length === 0, 'Seasons draws nothing while it is off: its layers have no actors');
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

function keep(id: string) {
  const kept = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_data_dir(), `kept-${id}`]));
  copyFolder(Gio.File.new_for_path(userFolder(id)), kept);
  return {
    async restore() {
      kept.move(Gio.File.new_for_path(userFolder(id)), Gio.FileCopyFlags.NONE, null, null);
      await request('Reload', id);
    },
  };
}

async function checkRemovingSeasons() {
  const kept = keep(SEASONS);
  try {
    await request('Remove', SEASONS);
    await eventually(async () => !await listed(SEASONS), 'removing Seasons takes it away');
    require(!GLib.file_test(userFolder(SEASONS), GLib.FileTest.EXISTS), 'and deletes its folder');
    await request('Reload', SEASONS);
    require(!await listed(SEASONS), 'no other copy of Seasons comes back');
  } finally {
    await kept.restore();
  }
  await eventually(async () => (await listed(SEASONS))?.state === 'running', 'installing Seasons again runs it');
}

export async function run() {
  try {
    await checkSeasons();
    await checkDisabledCostsNothing();
    await checkEnabled();
    await checkDisabledCleansUp();
    await checkReload();
    await checkThrowing();
    await checkRemovingSeasons();
  } finally {
    for (const id of [PROBE, BROKEN]) await request('Remove', id);
    for (const key of ['disabled-extensions', 'extension-settings', 'extension-problems']) kestrel.reset(key);
  }
}
