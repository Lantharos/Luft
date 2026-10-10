import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {shownStyled} from '../../lib/actors.js';
import {repository, spawn} from '../../lib/processes.js';

const LOOK = repository('kestrel', 'look', 'target', 'release', 'luft-look');

export const lookDialog = () => shownStyled('kestrel-look-dialog');

function outcome(argv) {
  const process = spawn(argv, {flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE});
  return new Promise((resolve, reject) => process.communicate_utf8_async(null, null, (_process, result) => {
    try {
      const [, stdout, stderr] = process.communicate_utf8_finish(result);
      resolve({ok: process.get_successful(), stdout: stdout.trim(), stderr: stderr.trim()});
    } catch (error) {
      reject(error);
    }
  }));
}

export function look(...args) {
  return outcome([LOOK, ...args]);
}

export function oldScreenshot(filename) {
  return outcome(['gdbus', 'call', '--session', '--dest', 'org.gnome.Shell.Screenshot', '--object-path', '/org/gnome/Shell/Screenshot',
    '--method', 'org.gnome.Shell.Screenshot.Screenshot', 'false', 'false', filename]);
}

export function stopProcess(pid) {
  GLib.spawn_command_line_sync(`kill ${pid}`);
}
