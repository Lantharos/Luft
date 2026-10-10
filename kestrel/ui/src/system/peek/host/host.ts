import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import { identify, type Caller } from '../access/callers.js';
import { PidFd, cgroupOf } from '../access/processes.js';
import type { Level } from '../access/prompt.js';
import { listedWindows, waitForWindow } from '../control/windows.js';
import { PeekError } from '../errors.js';
import type { Policy } from '../policy.js';
import { PeekService } from '../service.js';

const ENVIRONMENT = ['WAYLAND_DISPLAY', 'DISPLAY', 'XAUTHORITY'];

export interface HostContext {
  activateWindow(window: Meta.Window): void;
  canInteract(): boolean;
}

class HostPolicy implements Policy {
  readonly ownsTheSeat = true;

  constructor(private readonly owner: Caller, private readonly handle: string) {}

  identify(pid: number): Caller | null {
    return identify(pid, () => null);
  }

  admit(caller: Caller): void {
    if (caller.unit !== this.owner.unit) throw new PeekError('Denied', 'This display belongs to another program');
  }

  held(): Level {
    return 'use';
  }

  async require(): Promise<void> {}

  handleOf(): string {
    return this.handle;
  }

  windowsOf(handle: string): Meta.Window[] {
    this.check(handle);
    return listedWindows();
  }

  waitForWindow(handle: string, _caller: Caller, timeout: number): Promise<Meta.Window> {
    this.check(handle);
    return waitForWindow(new Set(), () => true, timeout);
  }

  launch(): Promise<string> {
    throw new PeekError('InvalidArgs', 'Programs in a hidden display are started by peek run');
  }

  async stop(handle: string): Promise<void> {
    this.check(handle);
    const own = cgroupOf('self')!;
    const kill = Gio.File.new_for_path(`/sys/fs/cgroup${own.slice(0, own.lastIndexOf('/'))}/program/cgroup.kill`).append_to(Gio.FileCreateFlags.NONE, null);
    kill.write_all(new TextEncoder().encode('1'), null);
    kill.close(null);
  }

  reset(): void {}

  private check(handle: string): void {
    if (handle !== this.handle) throw new PeekError('NotFound', `This display was started as ${this.handle}, not ${handle}`);
  }
}

function ownerOf(fd: number): Caller {
  const process = new PidFd(fd);
  const pid = process.pid;
  const owner = pid ? identify(pid, () => null) : null;
  const alive = process.pid === pid;
  process.close();
  if (!owner || !alive) throw new Error('The program that asked for this display ended before it was ready');
  return owner;
}

function announce(fd: number): void {
  const environment = ENVIRONMENT.flatMap(name => {
    const value = GLib.getenv(name);
    return value ? [`${name}=${value}\n`] : [];
  }).join('');
  const stream = new GioUnix.OutputStream({ fd, close_fd: true });
  stream.write_all(new TextEncoder().encode(environment), null);
  stream.close(null);
}

function takeEnvironment(name: string): string {
  const value = GLib.getenv(name);
  if (!value) throw new Error(`${name} is not set for a hidden display`);
  GLib.unsetenv(name);
  return value;
}

export function startPeekHost(context: HostContext): PeekService {
  const owner = ownerOf(Number(takeEnvironment('PEEK_OWNER_FD')));
  const policy = new HostPolicy(owner, takeEnvironment('PEEK_HANDLE'));
  const ready = Number(takeEnvironment('PEEK_READY_FD'));
  const screen = { sessionMode: { isLocked: false }, screenShield: null, canInteract: context.canInteract };
  return new PeekService(screen, context.activateWindow, policy, () => announce(ready));
}
