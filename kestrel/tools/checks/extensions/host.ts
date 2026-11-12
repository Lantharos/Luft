import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {pause} from '../lib/wait.js';
import {descendants, named} from '../lib/actors.js';
import {ownFolder, removeFolder, request} from './lib/extensions.js';
import {hostsOf, installOwn, longestStall, privateKib} from './lib/sandbox.js';

const {require, eventually} = checks('extensions');
const MEASURED = 'com.example.Measured';
const RUNS = 7;
const IDLE_MS = 150;

const mib = (kib: number) => (kib / 1024).toFixed(1);
const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const kestrel = `${new Gio.Credentials().get_unix_pid()}`;
const shown = () => descendants(named('kestrel-extension-items')!).some(actor => actor.accessible_name === 'Sandboxed' && actor.mapped);

export async function run() {
  installOwn('sandboxed', MEASURED);
  await request('Disable', MEASURED);
  await request('Reload', MEASURED);
  const ready: number[] = [];
  const own: number[] = [];
  const shell: number[] = [];
  const stalls: number[] = [];
  const idle: number[] = [];
  try {
    for (let run = 0; run < RUNS; run++) {
      const quiet = longestStall();
      await pause(IDLE_MS);
      idle.push(quiet.stop());
      const before = privateKib(kestrel);
      const watch = longestStall();
      const started = GLib.get_monotonic_time();
      await request('Enable', MEASURED);
      await eventually(shown, run ? `sandboxed extension ${run + 1} shows its taskbar item` : 'a sandboxed extension starts in its host and shows its taskbar item', 20000);
      ready.push((GLib.get_monotonic_time() - started) / 1000);
      stalls.push(watch.stop());
      const [host] = hostsOf(MEASURED);
      require(host, 'its host runs');
      own.push(privateKib(host));
      shell.push(privateKib(kestrel) - before);
      await request('Disable', MEASURED);
      await eventually(() => !hostsOf(MEASURED).length && !shown(), 'turning it off ends the host', 3000);
    }
  } finally {
    await request('Remove', MEASURED);
    if (GLib.file_test(ownFolder(MEASURED), GLib.FileTest.IS_DIR)) removeFolder(Gio.File.new_for_path(ownFolder(MEASURED)));
  }
  console.log(`Kestrel extensions host: its taskbar item shows ${median(ready).toFixed(1)} ms after Enable (${Math.min(...ready).toFixed(1)}–${Math.max(...ready).toFixed(1)} ms), ${mib(median(own))} MiB not shared in the host, ${mib(median(shell))} MiB more in Kestrel, longest pause of Kestrel's main loop ${median(stalls).toFixed(1)} ms against ${median(idle).toFixed(1)} ms while idle (median of ${RUNS})`);
}
