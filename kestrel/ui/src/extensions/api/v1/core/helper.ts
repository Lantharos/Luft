import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { confinedPath } from './confined.js';
import type { ApiContext } from './context.js';
import type { Disposable, Helper, HelperProcess, Manifest } from '../types.js';

Gio._promisify(Gio.OutputStream.prototype, 'write_all_async');
Gio._promisify(Gio.DataInputStream.prototype, 'read_line_async');

type HelperContext = Pick<ApiContext, 'path' | 'manifest' | 'scope' | 'helpers'>;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function listeners<Arg>(context: HelperContext, owned: Disposable[]) {
  const callbacks = new Set<(arg: Arg) => void>();
  return {
    emit: (arg: Arg) => callbacks.forEach(callback => callback(arg)),
    add: (callback: (arg: Arg) => void): Disposable => {
      const guarded = context.scope.guard(callback);
      callbacks.add(guarded);
      const listening = context.scope.disposable(() => callbacks.delete(guarded));
      owned.push(listening);
      return listening;
    },
  };
}

function spawn(folder: string, { helper }: Manifest, args: string[], flags: Gio.SubprocessFlags): Gio.Subprocess {
  const launcher = new Gio.SubprocessLauncher({ flags });
  launcher.set_cwd(folder);
  launcher.setenv('LUFT_EXTENSION_DIR', folder, true);
  return launcher.spawnv([confinedPath([folder], helper!.path), ...args]);
}

function start(context: HelperContext, args: string[]): HelperProcess {
  const process = spawn(context.path, context.manifest, args, Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE);
  const running = new Gio.Cancellable();
  const owned: Disposable[] = [];
  const lines = listeners<string>(context, owned);
  const exits = listeners<number>(context, owned);
  const input = process.get_stdin_pipe()!;
  const output = new Gio.DataInputStream({ base_stream: process.get_stdout_pipe()! });
  let alive = true;
  let writing = Promise.resolve();
  context.helpers.add(process);

  const read = async () => {
    for (;;) {
      const [line] = await output.read_line_async(GLib.PRIORITY_DEFAULT, running);
      if (line === null) return;
      lines.emit(decoder.decode(line));
    }
  };
  read().catch(() => {});
  const stop = context.scope.disposable(() => {
    alive = false;
    context.helpers.delete(process);
    running.cancel();
    process.force_exit();
    for (const listening of owned.splice(0)) listening.dispose();
  });
  process.wait_async(running, () => {
    if (!alive) return;
    alive = false;
    exits.emit(process.get_if_exited() ? process.get_exit_status() : 128 + process.get_term_sig());
    stop.dispose();
  });
  return {
    get running() {
      return alive;
    },
    write: line => (writing = writing.catch(() => {}).then(async () => {
      await input.write_all_async(encoder.encode(`${line}\n`), GLib.PRIORITY_DEFAULT, running);
    })),
    onLine: received => lines.add(received),
    onExit: exited => exits.add(exited),
    close: () => input.close_async(GLib.PRIORITY_DEFAULT, null, null),
    dispose: () => stop.dispose(),
  };
}

export function runTurnedOffHelper(path: string, manifest: Manifest): void {
  if (manifest.helper?.turnedOff) spawn(path, manifest, manifest.helper.turnedOff, Gio.SubprocessFlags.NONE);
}

export function helperApi(context: HelperContext): Helper {
  return { start: (args = []) => start(context, args) };
}
