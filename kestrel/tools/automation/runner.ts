import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {failureOf} from '../checks/lib/errors.js';
import {within} from '../checks/lib/wait.js';

export interface Group {
  run(): Promise<void>;
  timeout?: number;
}

const CHECKS = GLib.build_filenamev([KESTREL_TOOLS.built, 'checks']);
const GROUP_TIMEOUT = 300000;
const cleanups: (() => Promise<void>)[] = [];

export function atSessionEnd(cleanup: () => Promise<void>) {
  cleanups.push(cleanup);
}

export async function endSession() {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
}

function moduleOf(group: string) {
  const [checks] = group.split('+');
  return Gio.File.new_for_path(GLib.build_filenamev([CHECKS, ...checks.split(':')]) + '.js').get_uri();
}

function record(group: string, passed: boolean, seconds: number, message = '') {
  const line = [passed ? 'pass' : 'fail', seconds, message.split('\n')[0]].join('\t');
  GLib.file_set_contents(GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_RESULTS')!, `${group}.tsv`]), `${line}\n`);
}

export async function runGroup(group: string, reset: () => Promise<void>) {
  const started = GLib.get_monotonic_time();
  const seconds = () => Math.round((GLib.get_monotonic_time() - started) / 1e5) / 10;
  console.log(`Kestrel group started: ${group}`);
  try {
    const checks: Group = await import(moduleOf(group));
    await within(checks.run(), checks.timeout ?? GROUP_TIMEOUT, `${group} finishes`);
    await reset();
    record(group, true, seconds());
    console.log(`Kestrel group passed: ${group} in ${seconds()} s`);
    return true;
  } catch (error) {
    const failure = failureOf(error);
    record(group, false, seconds(), failure.message);
    console.log(`Kestrel group failed: ${group} in ${seconds()} s: ${failure.message}`);
    logError(failure, group);
    return false;
  }
}
