import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {Main, QuickMenuToggle} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, named, ofType} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {closeStart, groupTitles, openStart, rows, search, titleOf} from '../start/search/results.js';
import {install, listed, ownFolder, removeFolder, request, setSetting} from './lib/extensions.js';
import {hostsOf, installOwn} from './lib/sandbox.js';

const {require, eventually} = checks('sandboxed extensions');
const SANDBOXED = 'com.example.Sandboxed';
const ASKER = 'com.example.Asker';
const STORE_ONLY = 'com.example.Drawing';

interface Asker {
  peers: {handles(id: string, name: string): boolean; request(id: string, name: string, value?: unknown): Promise<unknown>};
}

interface Report {
  helper: string;
  pid: number;
  on: boolean;
  kept: unknown;
  active: boolean;
  dark: boolean;
  text: string | null;
  home: string[];
}

const taskbarItem = () => descendants(named('kestrel-extension-items')!).find(actor => actor.accessible_name === 'Sandboxed' && actor.mapped) ?? null;
const tile = () => descendants(named('kestrel-quick-settings')!).find(actor => actor instanceof QuickMenuToggle && actor.title === 'Sandboxed') ?? null;
const notified = (title: string) => Main.messageTray.getSources().some(source => source.notifications.some(notification => notification.title === title));
const asker = () => (globalThis as {asker?: Asker}).asker ?? null;
const sandboxedLoads = () => (globalThis as {sandboxedLoads?: number}).sandboxedLoads ?? 0;

async function page(): Promise<{title?: string}[]> {
  const [json] = (await call('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Extensions', 'com.lantharos.Kestrel.Extensions', 'Page', new GLib.Variant('(s)', [SANDBOXED]), '(s)')).deepUnpack<[string]>();
  return json ? JSON.parse(json) : [];
}

async function checkRuns() {
  installOwn('sandboxed', SANDBOXED);
  await request('Reload', SANDBOXED);
  const running = await eventually(async () => (await listed(SANDBOXED))?.state === 'running' && listed(SANDBOXED), 'an extension in the account’s own folder runs', 20000);
  require(running.origin === 'own' && sandboxedLoads() === 0, 'it is listed as one from the own folder, and none of its code ran inside the desktop');
  const host = await eventually(() => hostsOf(SANDBOXED)[0], 'it runs in a host process of its own, in a sandbox');
  require(Number(host) !== new Gio.Credentials().get_unix_pid(), `the host is a separate process (${host})`);
  return host;
}

async function checkSurfaces() {
  await eventually(() => taskbarItem(), 'its taskbar item shows');
  await eventually(() => tile(), 'and its quick settings toggle');
  ofType(taskbarItem(), St.Button).emit('clicked', 1);
  await eventually(() => notified('Hello from the sandbox'), 'clicking the item reaches the host, which sends a notification');
  await setSetting(SANDBOXED, 'on', new GLib.Variant('b', true));
  await eventually(() => (tile() as InstanceType<typeof QuickMenuToggle>).checked, 'a setting changed over D-Bus reaches its toggle');
  await openStart();
  search('needle');
  await eventually(() => groupTitles().includes('Sandboxed') && rows().some(row => titleOf(row) === 'Sandboxed found needle'), 'its search results come back from the host');
  closeStart();
  const sections = await page();
  require(sections.some(section => section.title === 'Probed'), 'its own Settings page is built in the host');
}

async function checkPeers(host: string) {
  install('asker', ASKER);
  await request('Reload', ASKER);
  const ask = await eventually(() => asker(), 'an extension inside the desktop runs next to it');
  await eventually(() => ask.peers.handles(SANDBOXED, 'report'), 'and sees that the sandboxed one answers requests');
  const report = await ask.peers.request(SANDBOXED, 'report') as Report;
  require(report.pid !== Number(host) && report.pid < 10, `inside, it sees only its own few processes (it is process ${report.pid})`);
  require(report.on === true && report.active === true && typeof report.dark === 'boolean', 'its settings, the session and the appearance read the same in the sandbox');
  require(report.kept === 'kept' && report.text === 'written', `it keeps stored values and reads back the files it wrote (${JSON.stringify([report.kept, report.text])})`);
  const [said, processes] = report.helper.split(' ');
  require(said === 'hi' && Number(processes) < 10, `its helper runs in the same sandbox and answers it (it sees ${processes} processes)`);
  require(report.home.length === 0, `it sees nothing of the home folder (${report.home.join(', ')})`);
  const file = GLib.build_filenamev([GLib.get_user_state_dir(), 'luft', 'extension-storage', `${SANDBOXED}.json`]);
  await eventually(() => GLib.file_test(file, GLib.FileTest.EXISTS) && new TextDecoder().decode(GLib.file_get_contents(file)[1]).includes('"kept"'), 'what it stored is written by the desktop');
}

async function checkStoreOnly() {
  installOwn('marker', STORE_ONLY, text => `${text}permissions = ["wallpaper"]\n`);
  await request('Reload', STORE_ONLY);
  const listing = await eventually(() => listed(STORE_ONLY), 'an extension that draws on the wallpaper, in the own folder, is listed');
  require(listing.state === 'store-only' && listing.problem.includes('wallpaper'), `it waits to come from schelf.store and says why (${listing.problem})`);
}

async function checkTurnedOff(host: string) {
  await request('Disable', SANDBOXED);
  await eventually(() => !taskbarItem() && !tile(), 'turning it off takes its item and toggle away');
  await eventually(() => !GLib.file_test(`/proc/${host}`, GLib.FileTest.EXISTS), 'and ends its host', 3000);
  await request('Enable', SANDBOXED);
  await eventually(() => taskbarItem(), 'turning it on again starts a new host', 20000);
}

export async function run() {
  try {
    const host = await checkRuns();
    await checkSurfaces();
    await checkPeers(host);
    await checkStoreOnly();
    await checkTurnedOff(host);
  } finally {
    for (const id of [SANDBOXED, ASKER, STORE_ONLY]) await request('Remove', id);
    for (const id of [SANDBOXED, STORE_ONLY]) if (GLib.file_test(ownFolder(id), GLib.FileTest.IS_DIR)) removeFolder(Gio.File.new_for_path(ownFolder(id)));
  }
}
