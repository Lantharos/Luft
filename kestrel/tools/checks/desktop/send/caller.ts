import type Meta from 'gi://Meta';

import {gjs, outcome, type Process, spawn, stop, waitForWindow, windows} from '../../lib/processes.js';
import {waitUntil} from '../../lib/wait.js';

const TITLE = 'Kestrel send caller';
const ANSWER = new RegExp(`^${TITLE} (\\d+): (.*)$`);
const SCRIPT = 'clients/windows/sendCaller.js';

/** The files a caller sends, by the name it gives each. */
export type Files = Record<string, string>;

export const callerArguments = (files: Files) => Object.entries(files).map(([name, path]) => `${name}=${path}`);

/**
 * A window that asks Kestrel to send files when told to, and shows in its title how each call went, so the check sees
 * what an app would, inside a sandbox too.
 */
export class Caller {
  private answered = 0;

  private constructor(readonly window: Meta.Window, private readonly process: Process) {}

  static async start(files: Files, label: string): Promise<Caller> {
    return Caller.launch(() => gjs(SCRIPT, callerArguments(files)), label);
  }

  /** A caller started some other way, such as inside a sandbox, found by its window. */
  static async run(argv: string[], label: string, accepts: (window: Meta.Window) => boolean = () => true): Promise<Caller> {
    return Caller.launch(() => spawn(argv), label, accepts);
  }

  private static async launch(start: () => Process, label: string, accepts: (window: Meta.Window) => boolean = () => true) {
    const earlier = new Set(windows());
    const process = start();
    const window = await waitForWindow(candidate => !earlier.has(candidate) && candidate.get_title()?.startsWith(TITLE) && accepts(candidate), label, 30000);
    window.activate(global.get_current_time());
    await waitUntil(() => global.display.focus_window === window, `${label}, in front`);
    return new Caller(window, process);
  }

  send(): Promise<unknown> {
    return outcome(['kill', '-USR1', String(this.window.get_pid())]);
  }

  probe(): Promise<unknown> {
    return outcome(['kill', '-USR2', String(this.window.get_pid())]);
  }

  /** The next answer the window shows. */
  async next(label: string, timeout?: number): Promise<string> {
    const [, number, answer] = await waitUntil(() => {
      const match = ANSWER.exec(this.window.get_title() ?? '');
      return match && Number(match[1]) > this.answered && match;
    }, label, timeout);
    this.answered = Number(number);
    return answer!;
  }

  /** Ends the caller, and its window with it, which in a sandbox belongs to a process of its own. */
  async stop(): Promise<void> {
    await outcome(['kill', String(this.window.get_pid())]);
    await stop(this.process);
    await waitUntil(() => !windows().includes(this.window), 'the caller\'s window closes');
  }
}
