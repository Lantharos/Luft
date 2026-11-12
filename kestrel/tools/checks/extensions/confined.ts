import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {install, listed, ownFolder, removeFolder, request} from './lib/extensions.js';
import {hostsOf, installOwn, longestStall} from './lib/sandbox.js';

const {require, eventually} = checks('sandboxed extensions');
const HOSTILE = 'com.example.Hostile';
const ASKER = 'com.example.Asker';
const MOST_STALL_MS = 1000;

interface Asker {
  peers: {handles(id: string, name: string): boolean; request(id: string, name: string, value?: unknown): Promise<unknown>};
}

const asker = () => (globalThis as {asker?: Asker}).asker ?? null;
const attack = async (name: string, details: Record<string, unknown> = {}) => String(await asker()!.peers.request(HOSTILE, 'attack', {attack: name, ...details}));

async function start() {
  installOwn('hostile', HOSTILE, text => text.replace(/permissions = .*/, 'permissions = ["clipboard", "sounds", "taskbar", "popups"]'));
  await request('Reload', HOSTILE);
  await eventually(async () => (await listed(HOSTILE))?.state === 'running', 'the hostile extension runs from the own folder, in its sandbox', 20000);
  await eventually(() => asker()?.peers.handles(HOSTILE, 'attack'), 'and takes requests to try things');
}

function plantSecret(): string {
  const file = GLib.build_filenamev([GLib.get_home_dir(), 'secret.txt']);
  GLib.file_set_contents(file, 'not yours');
  return file;
}

function listener(): {port: number; stop(): void} {
  const service = new Gio.SocketService();
  const port = service.add_any_inet_port(null);
  service.start();
  return {port, stop: () => service.stop()};
}

async function checkReach() {
  const secret = plantSecret();
  require((await attack('home', {file: secret})).startsWith('refused'), 'it cannot read a file in the home folder');
  const local = listener();
  try {
    require((await attack('loopback', {port: local.port})).startsWith('refused'), 'it cannot reach a port the session listens on');
  } finally {
    local.stop();
  }
  require((await attack('internet')).startsWith('refused'), 'it cannot reach the internet');
  require((await attack('bus', {address: GLib.getenv('DBUS_SESSION_BUS_ADDRESS')})).startsWith('refused'), 'it cannot connect to the session bus');
  require((await attack('process', {pid: new Gio.Credentials().get_unix_pid()})).startsWith('refused'), 'it cannot see the desktop’s process');
  const link = await attack('link', {file: GLib.build_filenamev([GLib.get_home_dir(), 'secret.txt'])});
  require(/^refused: .*outside the extension's folders/.test(link), `a link it plants in its data folder is refused by the desktop (${link})`);
  const memory = await attack('memory');
  require(memory.startsWith('refused'), `it cannot take more than its share of memory (${memory})`);
  require((await listed(HOSTILE))?.state === 'running', 'all of that leaves it running');
}

async function checkStall() {
  const [host] = hostsOf(HOSTILE);
  const watch = longestStall();
  const answer = attack('stall').then(() => 'answered', error => (error as Error).message);
  const failed = await eventually(async () => (await listed(HOSTILE))?.state === 'failed' && listed(HOSTILE), 'a host that hangs is turned off', 15000);
  const stalled = watch.stop();
  require(failed.problem.includes('longer than 10 seconds'), `and says it stopped answering (${failed.problem})`);
  require(stalled < MOST_STALL_MS, `the desktop kept running meanwhile (its longest pause was ${stalled.toFixed(0)} ms)`);
  await answer;
  await eventually(() => !GLib.file_test(`/proc/${host}`, GLib.FileTest.EXISTS), 'and its host is gone', 3000);
}

async function checkFlood() {
  await request('Enable', HOSTILE);
  await eventually(() => asker()?.peers.handles(HOSTILE, 'attack'), 'it runs again once turned back on', 20000);
  const watch = longestStall();
  void attack('flood').catch(() => {});
  const failed = await eventually(async () => (await listed(HOSTILE))?.state === 'failed' && listed(HOSTILE), 'a host that floods the desktop with calls is turned off', 10000);
  const stalled = watch.stop();
  require(failed.problem.includes('more than the desktop takes'), `and says why (${failed.problem})`);
  require(stalled < MOST_STALL_MS, `the desktop kept running meanwhile (its longest pause was ${stalled.toFixed(0)} ms)`);
}

export async function run() {
  install('asker', ASKER);
  await request('Reload', ASKER);
  await eventually(() => asker(), 'an extension inside the desktop runs to ask it');
  try {
    await start();
    await checkReach();
    await checkStall();
    await checkFlood();
  } finally {
    for (const id of [HOSTILE, ASKER]) await request('Remove', id);
    if (GLib.file_test(ownFolder(HOSTILE), GLib.FileTest.IS_DIR)) removeFolder(Gio.File.new_for_path(ownFolder(HOSTILE)));
    GLib.unlink(GLib.build_filenamev([GLib.get_home_dir(), 'secret.txt']));
  }
}
