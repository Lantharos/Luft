import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Setting, Value } from '../../../../../packages/web/settings-catalogue/catalogue.js';
import type { Requested } from './items.js';
import { Key, sync } from './keys.js';

Gio._promisify(Gio.DBusConnection.prototype, 'call');

const CHANGES = 'com.lantharos.Changes1';
const CHANGES_PATH = '/com/lantharos/Changes1';
const CRASH_REPORTS = 'com.lantharos.CrashReports1';
const CRASH_REPORTS_PATH = '/com/lantharos/CrashReports1';
const PROPERTIES = 'org.freedesktop.DBus.Properties';

export type Restore = Record<string, GLib.Variant>;

export interface Applied {
  made: boolean;
  restore: Restore[];
  error: string;
}

function variant(value: Value): GLib.Variant {
  if (typeof value === 'boolean') return new GLib.Variant('b', value);
  if (typeof value === 'string') return new GLib.Variant('s', value);
  return Number.isInteger(value) ? new GLib.Variant('x', value) : new GLib.Variant('d', value);
}

function message(error: unknown): string {
  if (!(error instanceof GLib.Error)) return String(error);
  Gio.DBusError.strip_remote_error(error);
  return error.message;
}

export async function systemValues(names: string[]): Promise<Map<string, Value>> {
  if (!names.length) return new Map();
  const reply = await Gio.DBus.system.call(CHANGES, CHANGES_PATH, CHANGES, 'Read', new GLib.Variant('(as)', [names]),
    new GLib.VariantType('(a(sv))'), Gio.DBusCallFlags.NONE, -1, null);
  const [values] = reply.recursiveUnpack() as [[string, Value][]];
  return new Map(values);
}

export async function serviceValues(names: string[]): Promise<Map<string, Value>> {
  if (!names.includes('crash-reports')) return new Map();
  const reply = await Gio.DBus.session.call(CRASH_REPORTS, CRASH_REPORTS_PATH, PROPERTIES, 'Get', new GLib.Variant('(ss)', [CRASH_REPORTS, 'Choice']),
    new GLib.VariantType('(v)'), Gio.DBusCallFlags.NONE, -1, null);
  return new Map([['crash-reports', reply.recursiveUnpack()[0] as Value]]);
}

/** Has the system service make the system settings, after one password for all of them. */
async function applySystem(changes: Requested[], restore: Restore[]): Promise<string> {
  if (!changes.length) return '';
  const sent = changes.map(({ setting, value }): [string, GLib.Variant] => [setting.system!, variant(value)]);
  const reply = await Gio.DBus.system.call(CHANGES, CHANGES_PATH, CHANGES, 'Apply', new GLib.Variant('(a(sv))', [sent]),
    new GLib.VariantType('(a(sv)s)'), Gio.DBusCallFlags.ALLOW_INTERACTIVE_AUTHORIZATION, -1, null);
  const [previous, error] = reply.deepUnpack() as [[string, GLib.Variant][], string];
  for (const [name, value] of previous) {
    const setting = changes.find(change => change.setting.system === name)!.setting;
    restore.push({ setting: new GLib.Variant('s', setting.id), value });
  }
  return error;
}

function keep(setting: Setting, name: string, restore: Restore[]): Key {
  const key = Key.open(name)!;
  const own = key.ownValue();
  restore.push({ setting: new GLib.Variant('s', setting.id), key: new GLib.Variant('s', name), ...(own === null ? {} : { own: new GLib.Variant('s', own) }) });
  return key;
}

async function applyPersonal({ setting, value }: Requested, current: Value | null, restore: Restore[]): Promise<void> {
  if (setting.key) {
    keep(setting, setting.key, restore).write(value);
    return;
  }
  if (setting.service) {
    await Gio.DBus.session.call(CRASH_REPORTS, CRASH_REPORTS_PATH, CRASH_REPORTS, 'SetChoice', new GLib.Variant('(s)', [String(value)]), null, Gio.DBusCallFlags.NONE, -1, null);
    restore.push({ setting: new GLib.Variant('s', setting.id), value: variant(current ?? '') });
    return;
  }
  const option = setting.options!.find(candidate => candidate.value === value)!;
  const names = [...new Set(setting.options!.flatMap(candidate => Object.keys(candidate.set ?? {})))];
  const keys = new Map(names.map(name => [name, keep(setting, name, restore)]));
  for (const [name, next] of Object.entries(option.set ?? {})) keys.get(name)!.write(next);
}

/**
 * Makes exactly the changes that were reviewed: the system ones first, since
 * they can still be refused at the password, and the rest only once those
 * went through.
 */
export async function apply(changes: Requested[], current: (Value | null)[]): Promise<Applied> {
  const restore: Restore[] = [];
  const system = changes.filter(change => change.setting.system);
  try {
    const error = await applySystem(system, restore);
    if (error) return { made: restore.length > 0, restore, error };
  } catch (error) {
    return { made: false, restore, error: message(error) };
  }
  try {
    for (const [index, change] of changes.entries())
      if (!change.setting.system) await applyPersonal(change, current[index], restore);
    return { made: true, restore, error: '' };
  } catch (error) {
    return { made: true, restore, error: message(error) };
  } finally {
    sync();
  }
}
