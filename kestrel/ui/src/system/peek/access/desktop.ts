import type Meta from 'gi://Meta';

import type { Policy } from '../policy.js';
import { listedWindows, waitForWindow } from '../control/windows.js';
import { identify, type Caller } from './callers.js';
import { windowAccess } from './grants.js';
import type { PidFd } from './processes.js';
import type { Level } from './prompt.js';

export class DesktopPolicy implements Policy {
  readonly ownsTheSeat = false;
  private readonly launches = windowAccess.launches;

  identify(pid: number): Caller | null {
    return identify(pid, unit => this.launches.ownerOf(unit));
  }

  admit(): void {}

  held(caller: Caller, window: Meta.Window | null): Level | null {
    return windowAccess.held(caller, window);
  }

  require(caller: Caller, window: Meta.Window | null, level: Level): Promise<void> {
    return windowAccess.require(caller, window, level);
  }

  handleOf(caller: Caller, window: Meta.Window): string {
    const launch = this.launches.launchOf(window);
    return launch?.owner.unit === caller.unit ? launch.handle : '';
  }

  windowsOf(handle: string, caller: Caller): Meta.Window[] {
    const launch = this.launches.byHandle(handle, caller);
    return listedWindows().filter(window => this.launches.launchOf(window) === launch);
  }

  waitForWindow(handle: string, caller: Caller, timeout: number): Promise<Meta.Window> {
    const launch = this.launches.byHandle(handle, caller);
    return waitForWindow(launch.ended, window => this.launches.launchOf(window) === launch, timeout);
  }

  async launch(caller: Caller, process: PidFd, program: PidFd): Promise<string> {
    return (await this.launches.launch(caller, process, program)).handle;
  }

  stop(handle: string, caller: Caller): Promise<void> {
    return this.launches.stop(this.launches.byHandle(handle, caller));
  }

  reset(): void {
    windowAccess.reset();
  }
}
