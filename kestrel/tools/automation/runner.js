import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {within} from '../checks/lib/wait.js';

const CHECKS = GLib.build_filenamev([GLib.path_get_dirname(GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0])), 'checks']);
const GROUP_TIMEOUT = 300000;
const cleanups = [];

export function atSessionEnd(cleanup) {
  cleanups.push(cleanup);
}

export async function endSession() {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
}

function moduleOf(group) {
  return Gio.File.new_for_path(GLib.build_filenamev([CHECKS, ...group.split(':')]) + '.js').get_uri();
}

function record(group, passed, seconds, message = '') {
  const line = [passed ? 'pass' : 'fail', seconds, message.split('\n')[0]].join('\t');
  GLib.file_set_contents(GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_RESULTS'), `${group}.tsv`]), `${line}\n`);
}

export async function runGroup(group, reset) {
  const started = GLib.get_monotonic_time();
  const seconds = () => Math.round((GLib.get_monotonic_time() - started) / 1e5) / 10;
  console.log(`Kestrel group started: ${group}`);
  try {
    const checks = await import(moduleOf(group));
    await within(checks.run(), checks.timeout ?? GROUP_TIMEOUT, `${group} finishes`);
    await reset();
    record(group, true, seconds());
    console.log(`Kestrel group passed: ${group} in ${seconds()} s`);
    return true;
  } catch (error) {
    record(group, false, seconds(), error.message);
    console.log(`Kestrel group failed: ${group} in ${seconds()} s: ${error.message}`);
    logError(error, group);
    return false;
  }
}
