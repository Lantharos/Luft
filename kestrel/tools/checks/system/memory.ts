import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {exists, read, removeTree, write} from '../apps/lib/files.js';
import {checks} from '../lib/check.js';
import {ownName, privateConnection} from '../lib/dbus.js';
import {clearNotifications} from '../lib/notifications.js';
import {fixture, spawn, stop, waitForWindow, type Process} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {watchdogPastResume} from '../lockScreen/lib/sleep.js';

const {require, eventually} = checks('memory');
const GIB = 2 ** 30;
const BUDGET = 5 * GIB;
const HANG_LIMIT = 30 * GLib.USEC_PER_SEC;
const HANG_STEP = 100 * 1000;
const PRESS_AFTER = 2 * GLib.USEC_PER_SEC;
const EVENT_SIZE = 24;
const EV_KEY = 1;
const KEY_POWER = 116;
const BALLAST = 'import os, runpy, sys; ballast = b"\\1" * (96 << 20); sys.argv = sys.argv[1:]; sys.path.insert(0, os.path.dirname(sys.argv[0])); runpy.run_path(sys.argv[0], run_name="__main__")';
const SYSTEMD = `<node><interface name="org.freedesktop.systemd1.Manager">
  <method name="SetUnitProperties"><arg type="s" direction="in"/><arg type="b" direction="in"/><arg type="a(sv)" direction="in"/></method>
</interface></node>`;

const manager = () => GLib.build_filenamev([GLib.getenv('LUFT_CGROUP_ROOT')!, read('/proc/self/cgroup').match(/^0::(.*\/user@\d+\.service)/m)![1]]);
const cgroupPath = (...parts: string[]) => GLib.build_filenamev([manager(), ...parts]);

class Systemd {
  readonly kept = new Map<string, number>();
  private readonly connection = privateConnection();
  private readonly exported = Gio.DBusExportedObject.wrapJSObject(SYSTEMD, {
    SetUnitProperties: (unit: string, _runtime: boolean, properties: [string, GLib.Variant][]) => {
      for (const [name, value] of properties) if (name === 'MemoryLow') this.kept.set(unit, Number(value.deepUnpack()));
    },
  });

  async own() {
    this.exported.export(this.connection, '/org/freedesktop/systemd1');
    require(await ownName(this.connection, 'org.freedesktop.systemd1'), 'a stand-in user manager takes the session bus name');
  }

  close() {
    this.exported.unexport();
    this.connection.close_sync(null);
  }
}

interface App {
  title: string;
  unit: string;
  process: Process;
  window: Meta.Window;
}

async function open(titles: string[], unit: string, gigabytes: number, command: string[]): Promise<App> {
  const process = spawn(['systemd-run', '--user', '--scope', '--quiet', '--collect', `--unit=${unit}`, ...command]);
  const windows = await Promise.all(titles.map(title => waitForWindow(title)));
  write(cgroupPath('app.slice', unit, 'memory.current'), `${gigabytes * GIB}\n`);
  write(cgroupPath('app.slice', unit, 'memory.swap.current'), '0\n');
  write(cgroupPath('app.slice', unit, 'cgroup.procs'), `${windows.map(window => window.get_pid()).join('\n')}\n`);
  write(cgroupPath('app.slice', unit, 'cgroup.kill'), '');
  return {title: titles.at(-1)!, unit, process, window: windows.at(-1)!};
}

const client = (title: string, appId: string) => ['python3', fixture('clients', 'wayland', 'namedClient.py'), title, appId];
const scope = (name: string) => `app-${name}-${GLib.random_int()}.scope`;
const closed = (app: App) => read(cgroupPath('app.slice', app.unit, 'cgroup.kill')).trim() === '1';
const notified = (title: string) => Main.messageTray.getSources().some(source => source.notifications.some(notification => notification.title === title));

function pressPowerButton() {
  const event = new Uint8Array(EVENT_SIZE);
  const fields = new DataView(event.buffer);
  fields.setUint16(16, EV_KEY, true);
  fields.setUint16(18, KEY_POWER, true);
  fields.setInt32(20, 1, true);
  const stream = Gio.File.new_for_path(GLib.build_filenamev([GLib.getenv('LUFT_INPUT_ROOT')!, 'dev', 'input', 'event0'])).append_to(Gio.FileCreateFlags.NONE, null);
  stream.write_all(event, null);
  stream.close(null);
}

function hangUntil(done: () => boolean): boolean {
  const started = GLib.get_monotonic_time();
  let pressed = false;
  while (GLib.get_monotonic_time() - started < HANG_LIMIT) {
    GLib.usleep(HANG_STEP);
    if (!pressed && GLib.get_monotonic_time() - started >= PRESS_AFTER) {
      pressPowerButton();
      pressed = true;
    }
    if (done()) return true;
  }
  return false;
}

async function close(app: App) {
  await stop(app.process);
  if (exists(cgroupPath('app.slice', app.unit))) removeTree(cgroupPath('app.slice', app.unit));
}

async function checkProtection(systemd: Systemd, game: App, notes: App) {
  const keeps = (unit: string, bytes: number) => systemd.kept.get(unit) === bytes;
  game.window.activate(global.get_current_time());
  game.window.make_fullscreen();
  await eventually(() => keeps('app.slice', BUDGET) && keeps(game.unit, BUDGET), 'the focused game\'s memory is kept, up to what the desktop leaves over');
  notes.window.activate(global.get_current_time());
  await eventually(() => notes.window.has_focus(), 'another app takes the focus');
  require(keeps(game.unit, BUDGET) && !systemd.kept.has(notes.unit), 'a fullscreen game keeps its memory while something else has the focus');
  game.window.unmake_fullscreen();
  await eventually(() => keeps(notes.unit, BUDGET) && keeps(game.unit, 0), 'out of fullscreen, the protection moves to the focused app');
  game.window.activate(global.get_current_time());
  game.window.make_fullscreen();
  await eventually(() => keeps(game.unit, BUDGET) && keeps(notes.unit, 0), 'and back to the game when it fills the screen again');
}

async function checkClosingOrder(game: App, notes: App, chat: App) {
  write(cgroupPath('session.slice', 'kestrel.service', 'memory.pressure'), 'some avg10=60.00 avg60=40.00 avg300=10.00 total=1\nfull avg10=40.00 avg60=20.00 avg300=5.00 total=1\n');
  await watchdogPastResume();
  require(hangUntil(() => closed(notes)), 'when the desktop is stuck on memory, the biggest app in the background is closed first');
  require(!closed(game) && !closed(chat), 'and only that one');
  await eventually(() => notified(`${notes.title} was closed to free memory`), 'the notice names what was closed', 10000);
  await close(notes);

  require(hangUntil(() => closed(chat)), 'still stuck, the next app in the background goes');
  require(!closed(game), 'while the focused game stays');
  await close(chat);

  require(!hangUntil(() => closed(game)), 'the focused game isn\'t closed before Luft warned about it');
  await eventually(() => notified('Luft is low on memory'), 'the warning names the game', 10000);
  require(Main.layoutManager.primaryMonitor!.inFullscreen && Main.messageTray.activeNotification?.title === 'Luft is low on memory',
    'and shows on top of it in fullscreen');
  require(Main.messageTray.activeNotification!.body?.startsWith(`${game.title} is using`), 'naming the game, not Steam');
  await capture('memory-warning-over-a-game');

  require(hangUntil(() => closed(game)), 'once warned, a desktop still stuck closes the game');
  await eventually(() => notified(`${game.title} was closed to free memory`), 'and says the game was closed, not Steam', 10000);
}

export async function run() {
  const systemd = new Systemd();
  await systemd.own();
  clearNotifications();
  const apps: App[] = [];
  try {
    const game = await open(['Stand-in Steam', 'Harbour Run'], scope('steam'), 4, ['sh', '-c', `python3 ${fixture('clients', 'wayland', 'namedClient.py')} 'Stand-in Steam' steam & exec python3 -c '${BALLAST}' "$@"`,
      'sh', fixture('clients', 'wayland', 'namedClient.py'), 'Harbour Run', 'steam_app_12345']);
    apps.push(game);
    apps.push(await open(['Notes'], scope('notes'), 2, client('Notes', 'notes')));
    apps.push(await open(['Chat'], scope('chat'), 1, client('Chat', 'chat')));
    const [, notes, chat] = apps;
    await checkProtection(systemd, game, notes);
    await checkClosingOrder(game, notes, chat);
  } finally {
    for (const app of apps) await close(app);
    const pressure = cgroupPath('session.slice', 'kestrel.service', 'memory.pressure');
    if (exists(pressure)) GLib.unlink(pressure);
    clearNotifications();
    systemd.close();
  }
}
