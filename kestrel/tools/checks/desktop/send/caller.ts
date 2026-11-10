import type Meta from 'gi://Meta';

import {gjs, outcome, type Process, spawn, stop, waitForWindow, windows} from '../../lib/processes.js';
import {waitUntil} from '../../lib/wait.js';

const TITLE = 'Kestrel send caller';
const ANSWER = new RegExp(`^${TITLE} (\\d+): (.*)$`);
const SCRIPT = 'clients/windows/sendCaller.js';

export type Files = Record<string, string>;

export const callerArguments = (files: Files) => Object.entries(files).map(([name, path]) => `${name}=${path}`);

export class Caller {
  private answered = 0;

  private constructor(readonly window: Meta.Window, private readonly process: Process) {}

  static async start(files: Files, label: string): Promise<Caller> {
    return Caller.launch(() => gjs(SCRIPT, callerArguments(files)), label);
  }

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

  async next(label: string, timeout?: number): Promise<string> {
    const [, number, answer] = await waitUntil(() => {
      const match = ANSWER.exec(this.window.get_title() ?? '');
      return match && Number(match[1]) > this.answered && match;
    }, label, timeout);
    this.answered = Number(number);
    return answer!;
  }

  async stop(): Promise<void> {
    await outcome(['kill', String(this.window.get_pid())]);
    await stop(this.process);
    await waitUntil(() => !windows().includes(this.window), 'the caller\'s window closes');
  }
}
