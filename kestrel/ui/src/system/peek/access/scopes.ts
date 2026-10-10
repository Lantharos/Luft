import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { PeekError } from '../errors.js';
import type { PidFd } from './processes.js';

const SYSTEMD_PATH = '/org/freedesktop/systemd1';
const MANAGER = 'org.freedesktop.systemd1.Manager';

function jobResult(systemd: Gio.DBusConnection, name: string): { result: Promise<string>; cancel(): void } {
  let id = 0;
  const result = new Promise<string>(resolve => {
    id = systemd.signal_subscribe(null, MANAGER, 'JobRemoved', SYSTEMD_PATH, null, Gio.DBusSignalFlags.NONE,
      (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [, , unit, outcome] = parameters.deepUnpack() as [number, string, string, string];
        if (unit !== name) return;
        systemd.signal_unsubscribe(id);
        resolve(outcome);
      });
  });
  return { result, cancel: () => systemd.signal_unsubscribe(id) };
}

export class Scopes {
  private systemd: Gio.DBusConnection | null = null;

  async start(name: string, program: PidFd): Promise<void> {
    const systemd = this.connection();
    const job = jobResult(systemd, name);
    const fds = new Gio.UnixFDList();
    fds.append(program.fd);
    const properties: [string, GLib.Variant][] = [
      ['PIDFDs', new GLib.Variant('ah', [0])],
      ['CollectMode', new GLib.Variant('s', 'inactive-or-failed')],
      ['Description', new GLib.Variant('s', 'Program started with peek')],
    ];
    try {
      await systemd.call_with_unix_fd_list(null, SYSTEMD_PATH, MANAGER, 'StartTransientUnit',
        new GLib.Variant('(ssa(sv)a(sa(sv)))', [name, 'fail', properties, []]), new GLib.VariantType('(o)'),
        Gio.DBusCallFlags.NONE, -1, fds, null);
    } catch (error) {
      job.cancel();
      throw error;
    }
    if (await job.result !== 'done') throw new PeekError('Failed', `systemd couldn't start ${name}`);
  }

  private connection(): Gio.DBusConnection {
    if (this.systemd && !this.systemd.is_closed()) return this.systemd;
    this.systemd = Gio.DBusConnection.new_for_address_sync(`unix:path=${GLib.get_user_runtime_dir()}/systemd/private`,
      Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT, null, null);
    this.systemd.call_sync(null, SYSTEMD_PATH, MANAGER, 'Subscribe', null, null, Gio.DBusCallFlags.NONE, -1, null);
    return this.systemd;
  }

  async stop(name: string): Promise<void> {
    await this.connection().call(null, SYSTEMD_PATH, MANAGER, 'StopUnit', new GLib.Variant('(ss)', [name, 'replace']),
      new GLib.VariantType('(o)'), Gio.DBusCallFlags.NONE, -1, null);
  }

  close(): void {
    this.systemd?.close(null, null);
  }
}
