import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import {checks} from '../lib/check.js';
import {firstLine, gjs, stop} from '../lib/processes.js';

const {require} = checks('extensions');
const RUNS = 9;
const PAGE_KIB = 4;

function memoryKib(pid: string): {resident: number; own: number} {
  const [, contents] = GLib.file_get_contents(`/proc/${pid}/statm`);
  const [, resident, shared] = new TextDecoder().decode(contents).split(' ').map(Number);
  return {resident: resident * PAGE_KIB, own: (resident - shared) * PAGE_KIB};
}

const mib = (kib: number) => (kib / 1024).toFixed(1);

const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

export async function run() {
  const ready: number[] = [];
  const resident: number[] = [];
  const own: number[] = [];
  for (let run = 0; run < RUNS; run++) {
    const started = GLib.get_monotonic_time();
    const host = gjs('clients/extensions/bareHost.js', [], {flags: Gio.SubprocessFlags.STDOUT_PIPE});
    require(await firstLine(host) === 'ready', run ? `bare extension host ${run + 1} starts` : 'a bare gjs extension host with GLib, GObject and Gio starts');
    ready.push((GLib.get_monotonic_time() - started) / 1000);
    const memory = memoryKib(host.get_identifier()!);
    resident.push(memory.resident);
    own.push(memory.own);
    await stop(host);
  }
  console.log(`Kestrel extensions host: ready in ${median(ready).toFixed(1)} ms, ${mib(median(resident))} MiB resident, ${mib(median(own))} MiB of it not shared (median of ${RUNS}; ${Math.min(...ready).toFixed(1)}–${Math.max(...ready).toFixed(1)} ms)`);
}
