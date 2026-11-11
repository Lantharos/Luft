import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, labelled, ofType, shown, styled} from '../../lib/actors.js';
import {call} from '../../lib/dbus.js';
import {click} from '../../lib/input/input.js';
import {scratch} from '../../lib/processes.js';
import {waitUntil} from '../../lib/wait.js';
import {request} from '../../extensions/lib/extensions.js';

export const REMINDERS = 'com.lantharos.Reminders';
export const FOCUS = 'com.lantharos.Focus';
export const STATE = scratch('reminders-restart.json');
const ELEMENT = `extension-element:${REMINDERS}/reminders`;
const REQUEUED = `0000~${GLib.getenv('KESTREL_CAPTURE_WORKER')}-desktop:reminders`;
const data = () => GLib.build_filenamev([GLib.get_user_data_dir(), 'luft', 'extension-data', REMINDERS, 'reminders.json']);

export interface Stored {
  id: string;
  title: string;
  kind: string;
  when: {day: string; time: string | null} | null;
  repeat: {unit: string; every: number; date?: number} | null;
  headsUp: number;
  persistent: boolean;
  nudgeDays: number | null;
  rung: {count: number; last: number} | null;
  snoozedUntil: number | null;
  warned: boolean;
  doneAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export const file = scratch;
export const read = (path: string) => new TextDecoder().decode(GLib.file_get_contents(path)[1]);
export const readJson = <Value>(path: string) => JSON.parse(read(path)) as Value;
export const saved = () => GLib.file_test(data(), GLib.FileTest.EXISTS) ? readJson<{reminders: Stored[]}>(data()).reminders : [];

export function reminder(id: string, change: Partial<Stored>): Stored {
  const now = Date.now();
  return {
    id, title: id, kind: 'reminder', when: null, repeat: null, headsUp: 0, persistent: true, nudgeDays: null, rung: null, snoozedUntil: null, warned: false, doneAt: null,
    createdAt: now, updatedAt: now, ...change,
  };
}

export function seed(reminders: Stored[]) {
  GLib.mkdir_with_parents(GLib.path_get_dirname(data()), 0o700);
  GLib.file_set_contents(data(), JSON.stringify({version: 1, reminders}));
}

export async function push(added: Stored) {
  await request('Disable', REMINDERS);
  seed([...saved().filter(({id}) => id !== added.id), added]);
  await request('Enable', REMINDERS);
  await waitUntil(element, 'Reminders is back in the taskbar');
}

export async function only(...reminders: Stored[]) {
  await request('Disable', REMINDERS);
  seed(reminders);
  await request('Enable', REMINDERS);
  await waitUntil(element, 'Reminders is back in the taskbar');
}

export function cleanSlate() {
  if (GLib.file_test(data(), GLib.FileTest.EXISTS)) GLib.unlink(data());
}

export const element = () => descendants(global.stage).find(actor => actor.name === ELEMENT && actor.mapped) ?? null;
export const popup = () => descendants(global.stage).find(actor => actor.name === 'kestrel-extension-popup' && actor.mapped) ?? null;
export const mentions = (root: Clutter.Actor | null, text: string) => !!root && descendants(root).some(actor => actor instanceof St.Label && actor.mapped && actor.text.includes(text));
export const banners = () => styled('notification-banner', Main.uiGroup).filter(shown);
export const bannerMentions = (text: string) => banners().some(banner => mentions(banner, text));

export function buttonIn(root: Clutter.Actor | null, name: string, by: 'accessible' | 'label' = 'accessible') {
  if (!root) return null;
  if (by === 'label') return descendants(root).find(actor => actor instanceof St.Button && (actor.label === name || labelled(name, actor)) && actor.mapped) as St.Button | undefined;
  return descendants(root).find(actor => actor instanceof St.Button && actor.accessible_name === name && actor.mapped) as St.Button | undefined;
}

export const answer = (name: string) => ofType(labelled(name, banners()[0]!), St.Button).emit('clicked', Clutter.BUTTON_PRIMARY);

export const row = (title: string) => popup() && descendants(popup()!).find(actor => actor instanceof St.Button && actor.accessible_name?.startsWith(`${title},`) && actor.mapped) as St.Button | undefined;

export async function openPanel() {
  click(element()!);
  await waitUntil(popup, 'the pop-up opens');
}

export const sentence = (lines: string[]) => `${lines.join('\r\n')}\r\n`;

export async function answerChooser(path: string) {
  await call('org.freedesktop.impl.portal.desktop.rover', '/org/freedesktop/portal/desktop', 'com.lantharos.KestrelChecks.FileChooser', 'Answer', new GLib.Variant('(s)', [Gio.File.new_for_path(path).get_uri()]));
}

export async function keepFor(id: string, stored: object) {
  await request('Disable', id);
  const path = GLib.build_filenamev([GLib.get_user_state_dir(), 'luft', 'extension-storage', `${id}.json`]);
  GLib.mkdir_with_parents(GLib.path_get_dirname(path), 0o700);
  GLib.file_set_contents(path, JSON.stringify(stored));
  await request('Reload', id);
  await request('Enable', id);
}

export const requeue = () => GLib.file_set_contents(GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_QUEUE')!, REQUEUED]), '');

export function crashKestrel() {
  const pid = Gio.Credentials.new().get_unix_pid();
  Gio.Subprocess.new(['sh', '-c', `kill -SEGV ${pid}; sleep 1; kill -SEGV ${pid}`], Gio.SubprocessFlags.NONE);
}
