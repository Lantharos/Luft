import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import St from 'gi://St';
import {IBusManager, KeyboardManager, getInputSourceManager} from 'resource:///com/lantharos/kestrel/kestrel.js';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {call} from '../../lib/dbus.js';
import {failureOf} from '../../lib/errors.js';
import {keyboard} from '../../lib/input/input.js';
import {captureFrame} from '../../lib/screenshots.js';
import {gjs, spawn, stop, waitForWindow, windows} from '../../lib/processes.js';
import {settled, Timeout, waitUntil, within} from '../../lib/wait.js';
import {changes, type Environment} from '../lib/apps.js';

const {eventually} = checks('Keys');
const KEY_LEFTCTRL = 29;
const KEY_LEFTSHIFT = 42;
const KEY_HOME = 102;
const KEY_END = 107;
const KEY_INSERT = 110;
const SOURCE_TIMEOUT = 5000;
const SIMPLE_ENGINE = 'org.freedesktop.IBus.Simple';
const IBUS_START = 15000;
const FIELD_TIMEOUT = 4000;
const COPY_TIMEOUT = 1000;

type Source = [string, string];

const inputSources = new Gio.Settings({schema_id: 'org.gnome.desktop.input-sources'});
const clipboard = St.Clipboard.get_default();
const readClipboard = () => new Promise<string>(resolve => clipboard.get_text(St.ClipboardType.CLIPBOARD, (_, text) => resolve(text ?? '')));

export const holdCode = (key: number) => keyboard().notify_key(GLib.get_monotonic_time(), key, Clutter.KeyState.PRESSED);
export const releaseCode = (key: number) => keyboard().notify_key(GLib.get_monotonic_time(), key, Clutter.KeyState.RELEASED);

export function code(...codes: number[]) {
  codes.forEach(holdCode);
  codes.toReversed().forEach(releaseCode);
}

export async function focus(window: Meta.Window) {
  window.activate(global.get_current_time());
  await waitUntil(() => window.has_focus(), `${window.get_title()} takes the keyboard`);
  if (window.get_client_type() === Meta.WindowClientType.WAYLAND) await settled();
}

export function savedSources() {
  const saved = {sources: inputSources.get_value('sources'), mru: inputSources.get_value('mru-sources')};
  return () => {
    inputSources.set_value('sources', saved.sources);
    inputSources.set_value('mru-sources', saved.mru);
  };
}

async function active([type, id]: Source, engineStarts: boolean) {
  if (getInputSourceManager().currentSource?.id !== id) return false;
  const engine = IBusManager.getIBusManager().engineName;
  if (type === 'xkb') return KeyboardManager.getKeyboardManager().currentLayout?.id === id && engine?.startsWith('xkb:') && simpleEngineRuns();
  return !engineStarts || engine === id;
}

export async function useSources(sources: Source[], label = `${sources[0][1]} is the input source`, {engineStarts = true}: {engineStarts?: boolean} = {}) {
  const value = new GLib.Variant('a(ss)', sources);
  inputSources.set_value('mru-sources', value);
  inputSources.set_value('sources', value);
  const manager = getInputSourceManager();
  const [[, id]] = sources;
  const source = await waitUntil(() => Object.values(manager.inputSources).find(candidate => candidate.id === id), `Kestrel offers ${id}`);
  if (manager.currentSource !== source) source.activate(true);
  await eventually(() => active(sources[0], engineStarts), label, SOURCE_TIMEOUT).catch((error: unknown) => {
    throw new Error(`${failureOf(error).message} (the input source is ${getInputSourceManager().currentSource?.id}, IBus uses ${IBusManager.getIBusManager().engineName})`);
  });
}

export async function startInputMethods() {
  const ibus = IBusManager.getIBusManager();
  const restarted = new Promise<void>(resolve => {
    const id = ibus.connect('ready', (_manager, ready) => {
      if (ready) return;
      ibus.disconnect(id);
      resolve();
    });
  });
  let xwaylandStarted = false;
  const opened = global.display.connect('x11-display-opened', () => (xwaylandStarted = true));
  const x11 = await openEntry(null, {GDK_BACKEND: 'x11'});
  global.display.disconnect(opened);
  await x11.close();
  if (xwaylandStarted) await within(restarted, SOURCE_TIMEOUT, 'IBus restarts for Xwayland');
  await eventually(() => ibus.isReady, 'IBus runs, so Keys can hand it input methods', IBUS_START);
}

export function keymapChanged() {
  return new Promise<void>(resolve => {
    const id = global.backend.connect('keymap-changed', () => {
      global.backend.disconnect(id);
      resolve();
    });
  });
}

export function simpleEngineRestarted() {
  const connection = IBusManager.getIBusManager().ibus.get_connection();
  let stopped = false;
  return new Promise<void>(resolve => {
    const id = connection.signal_subscribe(null, 'org.freedesktop.DBus', 'NameOwnerChanged', null, null, Gio.DBusSignalFlags.NONE,
      (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [name, , owner] = parameters.deepUnpack<[string, string, string]>();
        if (name !== SIMPLE_ENGINE) return;
        stopped ||= !owner;
        if (!stopped || !owner) return;
        connection.signal_unsubscribe(id);
        resolve();
      });
  });
}


async function simpleEngineRuns() {
  const reply = await call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'NameHasOwner',
    new GLib.Variant('(s)', [SIMPLE_ENGINE]), '(b)', {connection: IBusManager.getIBusManager().ibus.get_connection()});
  return reply.deepUnpack()[0];
}

export type Entry = Awaited<ReturnType<typeof openEntry>>;

export async function openEntry(argv: string[] | null = null, env: Environment = {}) {
  const before = new Set(windows());
  const process = argv ? spawn(argv, {env}) : gjs('clients/windows/window.js', ['--entry'], {env});
  const window = await waitForWindow(candidate => !before.has(candidate) && /^Kestrel (window check|entry)/.test(candidate.get_title() ?? ''),
    'the test entry opens');
  await focus(window);
  return {window, close: () => stop(process)};
}

export async function typeInto({window}: {window: Meta.Window}, act: () => void, expected: string, label: string) {
  await focus(window);
  act();
  await eventually(() => window.get_title() === `Kestrel entry: ${expected}`, label).catch((error: unknown) => {
    throw new Error(`${failureOf(error).message} (typed “${window.get_title()}”)`);
  });
}

async function copyField() {
  clipboard.set_text(St.ClipboardType.CLIPBOARD, '');
  code(KEY_LEFTCTRL, KEY_END);
  code(KEY_LEFTCTRL, KEY_LEFTSHIFT, KEY_HOME);
  code(KEY_LEFTCTRL, KEY_INSERT);
  let text = '';
  try {
    await waitUntil(async () => (text = await readClipboard()), 'the Try it field is copied', COPY_TIMEOUT);
  } catch (error) {
    if (!(error instanceof Timeout)) throw error;
  }
  return text;
}

export async function tryFieldHolds(app: LuftApp, act: () => void, expected: string, label: string) {
  await changes(app, 'the Try it field shows what is typed', act);
  let text: string | null = null;
  await eventually(async () => (text = await copyField()) === expected, label, FIELD_TIMEOUT)
    .catch(async (error: unknown) => {
      (await captureFrame()).save('keys-try-field-failed');
      throw new Error(`${failureOf(error).message} (the field holds “${text}”)`);
    });
}
