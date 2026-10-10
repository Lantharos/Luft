import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import { stealFd } from '../../../auth/keyring/prompter.js';
import { LookError } from '../errors.js';
import { PidFd, processUnit, statOf, unitName } from './processes.js';

export interface Caller {
  readonly unit: string;
  readonly name: string;
  readonly app: Shell.App | null;
}

const USER_MANAGER = /\/init\.scope$/;
const APP_UNIT = /^app-(.+?)(?:@[^@]*\.service|\.service|-[^-]+\.scope)$/;

const unescape = (text: string) => text.replace(/\\x([0-9a-f]{2})/g, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16)));

function appIds(unit: string): string[] {
  const match = APP_UNIT.exec(unitName(unit));
  if (!match) return [];
  const parts = match[1].split('-');
  return [parts, parts.slice(1)].filter(ids => ids.length).map(ids => unescape(ids.join('-')));
}

function installedApp(unit: string): Shell.App | null {
  const apps = Shell.AppSystem.get_default();
  for (const id of appIds(unit)) {
    const app = apps.lookup_app(`${id}.desktop`);
    if (app) return app;
  }
  return null;
}

function unitCaller(unit: string): Caller {
  const name = appIds(unit).at(-1) ?? unescape(unitName(unit).replace(/\.(?:scope|service)$/, ''));
  return { unit, name, app: null };
}

export function identify(pid: number, launchedBy: (unit: string) => Caller | null): Caller | null {
  let own: string | null = null;
  for (let current = pid; current > 1;) {
    const unit = processUnit(current);
    if (!unit || USER_MANAGER.test(unit)) break;
    own ??= unit;
    const owner = launchedBy(unit);
    if (owner) return owner;
    const app = installedApp(unit);
    if (app) return { unit, name: app.get_name(), app };
    current = statOf(current)?.parent ?? 0;
  }
  return own ? unitCaller(own) : null;
}

export async function callerProcess(invocation: Gio.DBusMethodInvocation): Promise<PidFd> {
  const [reply, fds] = await Gio.DBus.session.call_with_unix_fd_list('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus',
    'GetConnectionCredentials', new GLib.Variant('(s)', [invocation.get_sender()!]), new GLib.VariantType('(a{sv})'),
    Gio.DBusCallFlags.NONE, -1, null, null);
  const [credentials] = reply.deepUnpack() as [Record<string, GLib.Variant>];
  const fd = credentials.ProcessFD ? stealFd(fds, credentials.ProcessFD.deepUnpack() as number) : null;
  if (fd === null) throw new LookError('Failed', 'The session bus did not say which program is asking');
  return new PidFd(fd);
}
