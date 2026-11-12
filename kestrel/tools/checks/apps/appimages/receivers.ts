import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import {press} from '../../lib/input/input.js';
import {outcome, type Process, spawn, stop, waitForWindow, windows} from '../../lib/processes.js';
import {pause, waitUntil} from '../../lib/wait.js';
import {IN_SESSION} from '../lib/appImages.js';

const TITLE = 'Kestrel file receiver';
const ANSWER = new RegExp(`^${TITLE} (\\d+): (\\{.*\\})`);
const PASTE = 'USR1';
const PROBE = 'USR2';
const OPEN_TIMEOUT = 60000;
const ANSWER_TIMEOUT = 15000;
const FOCUSED_MS = 300;

export interface Received {
  path?: string | null;
  name?: string;
  text?: string;
  error?: string;
}

export interface Answer {
  how: string;
  offered: string[];
  files?: Received[];
  error?: string;
  unhanded?: Received[];
  shared?: string[];
}

/** A window in an app's sandbox that reports what is dropped on it or pasted into it in its title. */
export class Receiver {
  private answered = 0;

  private constructor(readonly window: Meta.Window, private readonly process: Process, private readonly pastes: () => unknown) {}

  static async gtk(argv: string[], id: string) {
    return Receiver.start(argv, id, 'a GTK 4 app in its sandbox opens a window', window =>
      () => outcome(['kill', `-${PASTE}`, String(window.get_pid())]));
  }

  static async page(argv: string[], id: string) {
    return Receiver.start(argv, id, 'Chromium opens the page in its sandbox', () =>
      () => press(Clutter.KEY_Control_L, Clutter.KEY_v));
  }

  private static async start(argv: string[], id: string, label: string, paste: (window: Meta.Window) => () => unknown) {
    const earlier = new Set(windows());
    const process = spawn(argv, IN_SESSION);
    const window = await waitForWindow(candidate => !earlier.has(candidate) && candidate.get_sandboxed_app_id() === id &&
      Boolean(candidate.get_title()?.startsWith(TITLE)), label, OPEN_TIMEOUT);
    return new Receiver(window, process, paste(window));
  }

  async focus() {
    this.window.activate(global.get_current_time());
    await waitUntil(() => global.display.focus_window === this.window, 'the receiving app comes to the front');
    await pause(FOCUSED_MS);
  }

  async paste(label: string) {
    await this.focus();
    await this.pastes();
    return this.next(label);
  }

  async probe(label: string) {
    await outcome(['kill', `-${PROBE}`, String(this.window.get_pid())]);
    return this.next(label);
  }

  async next(label: string): Promise<Answer> {
    const [, number, answer] = await waitUntil(() => {
      const match = ANSWER.exec(this.window.get_title() ?? '');
      return match && Number(match[1]) > this.answered && match;
    }, label, ANSWER_TIMEOUT);
    this.answered = Number(number);
    return JSON.parse(answer!) as Answer;
  }

  async stop() {
    this.window.delete(global.get_current_time());
    await stop(this.process);
  }
}

export function copyInto(folder: string, source: string, name: string) {
  GLib.mkdir_with_parents(folder, 0o755);
  const target = GLib.build_filenamev([folder, name]);
  Gio.File.new_for_path(source).copy(Gio.File.new_for_path(target), Gio.FileCopyFlags.OVERWRITE, null, null);
  return target;
}
