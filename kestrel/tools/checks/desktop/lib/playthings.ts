import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Mtk from 'gi://Mtk';

import {descendants} from '../../lib/actors.js';
import {call} from '../../lib/dbus.js';
import {type Point, rest} from '../../lib/input/input.js';
import {pause} from '../../lib/wait.js';
import {setSetting} from '../../extensions/lib/extensions.js';

export const PLAYTHINGS = 'com.lantharos.Playthings';
const NAME = 'com.lantharos.Kestrel';
const PATH = '/com/lantharos/Kestrel/Extensions';
const IFACE = 'com.lantharos.Kestrel.Extensions';
const CLOCK_TICKS = 100;
const ATTEMPTS = 3;

export const groups = () => descendants(global.stage).filter(actor => actor.name === `extension-sprite:${PLAYTHINGS}-group`);
export const parts = () => groups().flatMap(group => group.get_children());
export const labelled = (label: string) => parts().filter(actor => actor.accessible_name === label);
export const hasPart = (actor: Clutter.Actor | null) => !!actor && parts().includes(actor);

/** The part right after `actor`, which is added next. */
export const nextPart = (actor: Clutter.Actor) => parts()[parts().indexOf(actor) + 1];
export const middleOf = (actor: Clutter.Actor): Point => {
  const box = actor.get_transformed_extents();
  return [box.get_x() + box.get_width() / 2, box.get_y() + box.get_height() / 2];
};
export const turned = (actor: Clutter.Actor) => actor.get_rotation_angle(Clutter.RotateAxis.Z_AXIS);
export const topAt = (point: Point) => global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, ...point);

export async function choose(values: Record<string, GLib.Variant>) {
  for (const [key, value] of Object.entries(values)) await setSetting(PLAYTHINGS, key, value);
}

const on = (value: boolean) => new GLib.Variant('b', value);

/** Leaves only these kinds out, one setting at a time. */
export const only = (...kinds: string[]) => choose(Object.fromEntries(['lanterns', 'clouds', 'campfire', 'stars'].map(kind => [kind, on(kinds.includes(kind))])));
export const ambient = (value: boolean) => choose({ambient: on(value)});

async function page() {
  const reply = await call(NAME, PATH, IFACE, 'Page', new GLib.Variant('(s)', [PLAYTHINGS]), '(s)');
  return JSON.parse(reply.deepUnpack<[string]>()[0]) as {items: {type: string; title?: string; action?: string; setting?: string}[]}[];
}

export async function pressButton(title: string) {
  const button = (await page()).flatMap(section => section.items).find(item => item.type === 'button' && item.title === title)!;
  await call(NAME, PATH, IFACE, 'Act', new GLib.Variant('(ssv)', [PLAYTHINGS, button.action!, new GLib.Variant('b', true)]));
}

export const pageItems = async () => (await page()).flatMap(section => section.items);

export function setPowerProfile(profile: string) {
  return call('org.freedesktop.UPower.PowerProfiles', '/org/freedesktop/UPower/PowerProfiles', 'org.freedesktop.DBus.Properties', 'Set',
    new GLib.Variant('(ssv)', ['org.freedesktop.UPower.PowerProfiles', 'ActiveProfile', new GLib.Variant('s', profile)]), null, {connection: Gio.DBus.system});
}

export interface Cost {
  paints: number;
  wakeups: number;
  cpu: number;
  /** Paints a second of displays other than the main one. */
  elsewhere: number;
  /** Whether any part looks different at the end. */
  partsChanged: boolean;
}

function threadSwitches() {
  const tasks = Gio.File.new_for_path('/proc/self/task').enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
  let switches = 0;
  for (let info: Gio.FileInfo | null; (info = tasks.next_file(null));) {
    const [, status] = GLib.file_get_contents(`/proc/self/task/${info.get_name()}/status`);
    const text = new TextDecoder().decode(status);
    switches += Number(/\nvoluntary_ctxt_switches:\s+(\d+)/.exec(text)![1]) + Number(/nonvoluntary_ctxt_switches:\s+(\d+)/.exec(text)![1]);
  }
  return switches;
}

function cpuTicks() {
  const [, stat] = GLib.file_get_contents('/proc/self/stat');
  const fields = new TextDecoder().decode(stat).split(') ')[1].split(' ');
  return Number(fields[11]) + Number(fields[12]);
}

const looks = () => parts().map(actor => [actor.translation_x, actor.translation_y, turned(actor), actor.opacity, actor.scale_x, actor.scale_y, actor.visible]).join(';');

/** What Kestrel costs per second while `during` runs, or over `milliseconds` of leaving it alone. */
export async function cost(milliseconds: number, during: () => Promise<void> = () => pause(milliseconds)): Promise<Cost> {
  let frames = 0;
  let elsewhere = 0;
  const main = global.display.get_monitor_geometry(global.display.get_primary_monitor());
  const painted = global.stage.connect('after-paint', (_stage, view) => {
    const layout = new Mtk.Rectangle();
    view.get_layout(layout);
    frames++;
    if (layout.x !== main.x) elsewhere++;
  });
  const before = looks();
  const [switches, ticks, started] = [threadSwitches(), cpuTicks(), GLib.get_monotonic_time()];
  await during();
  const seconds = (GLib.get_monotonic_time() - started) / 1e6;
  const measured = {paints: frames / seconds, wakeups: (threadSwitches() - switches) / seconds, cpu: (cpuTicks() - ticks) / CLOCK_TICKS / seconds * 100, elsewhere: elsewhere / seconds, partsChanged: looks() !== before};
  global.stage.disconnect(painted);
  return measured;
}

/**
 * Measures until `accept` agrees, a few times at most. The taskbar's clock paints every display when the minute turns,
 * and Kestrel itself paints for a second or so now and then with no extension installed, so one window says little;
 * something Playthings does wrong shows in all of them.
 */
export async function steady(name: string, milliseconds: number, accept: (measured: Cost) => boolean) {
  let measured = await measure(name, milliseconds);
  for (let attempt = 1; attempt < ATTEMPTS && !accept(measured); attempt++) measured = await measure(`${name}, again`, milliseconds);
  return measured;
}

export async function measure(name: string, milliseconds = 8000, during?: () => Promise<void>) {
  if (!during) rest();
  if (!during) await pause(800);
  const measured = await cost(milliseconds, during);
  const shown = {paints: +measured.paints.toFixed(2), elsewhere: +measured.elsewhere.toFixed(2), wakeups: +measured.wakeups.toFixed(1), cpu: +measured.cpu.toFixed(2)};
  console.log(`Kestrel playthings, ${name}: ${JSON.stringify(shown)}`);
  return measured;
}
