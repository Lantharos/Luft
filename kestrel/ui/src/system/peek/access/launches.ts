import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';

import { PeekError } from '../errors.js';
import type { Caller } from './callers.js';
import { watchUnit } from './lifetime.js';
import { PidFd, processUnit, statOf, unitName } from './processes.js';
import { Scopes } from './scopes.js';

export interface Launch {
  readonly handle: string;
  readonly unit: string;
  readonly owner: Caller;
  readonly started: number;
  readonly stop: () => void;
  readonly ended: Set<() => void>;
}

const LETTERS = 'abcdefghijkmnpqrstuvwxyz';
const ALPHABET = `${LETTERS}23456789`;
const HANDLE_LENGTH = 10;

function randomHandle(): string {
  const stream = Gio.File.new_for_path('/dev/urandom').read(null);
  const bytes = stream.read_bytes(HANDLE_LENGTH, null).toArray();
  stream.close(null);
  return [...bytes].map((byte, index) => {
    const characters = index ? ALPHABET : LETTERS;
    return characters[byte % characters.length];
  }).join('');
}

export class Launches {
  private readonly launches = new Map<string, Launch>();
  private readonly scopes = new Scopes();

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

  async launch(owner: Caller, ownerProcess: PidFd, program: PidFd): Promise<Launch> {
    const pid = program.pid;
    const ownerPid = ownerProcess.pid;
    if (!pid || !ownerPid || statOf(pid)?.parent !== ownerPid)
      throw new PeekError('Denied', 'Only a program that peek run started itself can be launched');
    const name = `peek-${pid}.scope`;
    await this.scopes.start(name, program);
    const unit = processUnit(pid);
    const started = statOf(pid)?.started;
    if (program.pid !== pid || started === undefined || !unit || unitName(unit) !== name)
      throw new PeekError('Failed', 'The program ended while it was starting');
    const ended = new Set<() => void>();
    const launch: Launch = {
      handle: randomHandle(), unit, owner, started, ended,
      stop: watchUnit(unit, () => {
        this.launches.delete(unit);
        for (const notify of ended) notify();
      }),
    };
    this.launches.set(unit, launch);
    return launch;
  }

  byHandle(handle: string, caller: Caller): Launch {
    const launch = [...this.launches.values()].find(candidate => candidate.handle === handle);
    if (!launch || launch.owner.unit !== caller.unit)
      throw new PeekError('NotFound', `Nothing you started with peek run has the handle ${handle}, or it has quit`);
    return launch;
  }

  stop(launch: Launch): Promise<void> {
    return this.scopes.stop(unitName(launch.unit));
  }

  destroy(): void {
    for (const launch of this.launches.values()) launch.stop();
    this.launches.clear();
    this.scopes.close();
  }
}
