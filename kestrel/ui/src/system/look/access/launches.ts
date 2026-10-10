import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import { LookError } from '../errors.js';
import type { Caller } from './callers.js';
import { watchUnit } from './lifetime.js';
import { PidFd, processUnit, statOf, unitName } from './processes.js';

const SYSTEMD_PATH = '/org/freedesktop/systemd1';
const MANAGER = 'org.freedesktop.systemd1.Manager';

export interface Launch {
  readonly owner: Caller;
  readonly started: number;
  readonly stop: () => void;
  readonly ended: Set<() => void>;
}

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

export class Launches {
  private readonly launches = new Map<string, Launch>();
  private systemd: Gio.DBusConnection | null = null;

  ownerOf(unit: string): Caller | null {
    return this.launches.get(unit)?.owner ?? null;
  }

  launchOf(window: Meta.Window): Launch | null {
    const pid = window.get_pid() as number;
    const unit = pid > 0 ? processUnit(pid) : null;
    const launch = unit ? this.launches.get(unit) : undefined;
    return launch && (statOf(pid)?.started ?? -1) >= launch.started ? launch : null;
  }

  owner(window: Meta.Window): Caller | null {
    return this.launchOf(window)?.owner ?? null;
  }

  async launch(owner: Caller, ownerProcess: PidFd, program: PidFd): Promise<string> {
    const pid = program.pid;
    const ownerPid = ownerProcess.pid;
    if (!pid || !ownerPid || statOf(pid)?.parent !== ownerPid)
      throw new LookError('Denied', 'Only a program that luft-look run started itself can be launched');
    const name = `luft-look-${pid}.scope`;
    await this.startScope(name, program);
    const unit = processUnit(pid);
    const started = statOf(pid)?.started;
    if (program.pid !== pid || started === undefined || !unit || unitName(unit) !== name)
      throw new LookError('Failed', 'The program ended while it was starting');
    const ended = new Set<() => void>();
    this.launches.set(unit, {
      owner, started, ended,
      stop: watchUnit(unit, () => {
        this.launches.delete(unit);
        for (const notify of ended) notify();
      }),
    });
    return unit;
  }

  started(name: string, owner: Caller): Launch {
    const launch = [...this.launches].find(([unit]) => unitName(unit) === name)?.[1];
    if (!launch || launch.owner.unit !== owner.unit) throw new LookError('NotFound', `Nothing you started runs in ${name}`);
    return launch;
  }

  destroy(): void {
    for (const launch of this.launches.values()) launch.stop();
    this.launches.clear();
    this.systemd?.close(null, null);
  }

  private async startScope(name: string, program: PidFd): Promise<void> {
    const systemd = this.connection();
    const job = jobResult(systemd, name);
    const fds = new Gio.UnixFDList();
    fds.append(program.fd);
    const properties: [string, GLib.Variant][] = [
      ['PIDFDs', new GLib.Variant('ah', [0])],
      ['CollectMode', new GLib.Variant('s', 'inactive-or-failed')],
      ['Description', new GLib.Variant('s', 'Program started with luft-look')],
    ];
    try {
      await systemd.call_with_unix_fd_list(null, SYSTEMD_PATH, MANAGER, 'StartTransientUnit',
        new GLib.Variant('(ssa(sv)a(sa(sv)))', [name, 'fail', properties, []]), new GLib.VariantType('(o)'),
        Gio.DBusCallFlags.NONE, -1, fds, null);
    } catch (error) {
      job.cancel();
      throw error;
    }
    if (await job.result !== 'done') throw new LookError('Failed', `systemd couldn't start ${name}`);
  }

  private connection(): Gio.DBusConnection {
    if (this.systemd && !this.systemd.is_closed()) return this.systemd;
    this.systemd = Gio.DBusConnection.new_for_address_sync(`unix:path=${GLib.get_user_runtime_dir()}/systemd/private`,
      Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT, null, null);
    this.systemd.call_sync(null, SYSTEMD_PATH, MANAGER, 'Subscribe', null, null, Gio.DBusCallFlags.NONE, -1, null);
    return this.systemd;
  }
}
