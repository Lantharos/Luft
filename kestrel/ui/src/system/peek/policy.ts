import type Meta from 'gi://Meta';

import type { Caller } from './access/callers.js';
import type { Level } from './access/prompt.js';
import type { PidFd } from './access/processes.js';

export interface Policy {
  readonly ownsTheSeat: boolean;
  identify(pid: number): Caller | null;
  admit(caller: Caller): void;
  held(caller: Caller, window: Meta.Window | null): Level | null;
  require(caller: Caller, window: Meta.Window | null, level: Level): Promise<void>;
  handleOf(caller: Caller, window: Meta.Window): string;
  windowsOf(handle: string, caller: Caller): Meta.Window[];
  waitForWindow(handle: string, caller: Caller, timeout: number): Promise<Meta.Window>;
  launch(caller: Caller, process: PidFd, program: PidFd): Promise<string>;
  stop(handle: string, caller: Caller): Promise<void>;
  reset(): void;
}
