import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { ApiContext } from './context.js';
import type { Disposable, Helper, HelperProcess, Manifest } from './types.js';

Gio._promisify(Gio.OutputStream.prototype, 'write_all_async');

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function listeners<Arg>(context: ApiContext, owned: Disposable[]) {
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

function start(context: ApiContext, program: string, args: string[]): HelperProcess {
  const launcher = new Gio.SubprocessLauncher({ flags: Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE });
  launcher.set_cwd(context.path);
  launcher.setenv('LUFT_EXTENSION_DIR', context.path, true);
  const process = launcher.spawnv([program, ...args]);
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

export function runTurnedOffHelper(path: string, { helper }: Manifest): void {
  if (!helper?.turnedOff) return;
  const launcher = new Gio.SubprocessLauncher({ flags: Gio.SubprocessFlags.NONE });
  launcher.set_cwd(path);
  launcher.setenv('LUFT_EXTENSION_DIR', path, true);
  launcher.spawnv([GLib.build_filenamev([path, helper.path]), ...helper.turnedOff]);
}

export function helperApi(context: ApiContext): Helper {
  const program = GLib.build_filenamev([context.path, context.manifest.helper!.path]);
  return { start: (args = []) => start(context, program, args) };
}
