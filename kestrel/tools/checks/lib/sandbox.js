import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {fixture, outputLines, scratch, spawn} from './processes.js';
import {waitUntil} from './wait.js';

const SECURITY_CONTEXT = fixture('clients', 'wayland', 'securityContext.py');
const FLATPAK = 'org.flatpak';
let contexts = 0;

export const through = socket => socket ? {WAYLAND_DISPLAY: socket} : {};

export function bubblewrapped(appId) {
  const info = scratch(`flatpak-info-${appId}`);
  GLib.file_set_contents(info, `[Application]\nname=${appId}\n`);
  const runtime = GLib.get_user_runtime_dir();
  return ['bwrap', '--ro-bind', '/usr', '/usr', '--symlink', 'usr/lib64', '/lib64', '--symlink', 'usr/lib', '/lib', '--symlink', 'usr/bin', '/bin',
    '--proc', '/proc', '--dev', '/dev', '--bind', runtime, runtime, '--ro-bind', fixture('clients'), fixture('clients'), '--ro-bind', info, '/.flatpak-info'];
}

export async function launch(argv, {env = {}, label}) {
  const process = spawn(argv, {env, flags: Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE});
  const lines = outputLines(process);
  await waitUntil(() => lines.length > 0, label);
  return {process, lines};
}

export async function openSecurityContext(appId, {prefix = [], socket = null} = {}) {
  const path = scratch(`sandbox-${++contexts}`);
  const {process, lines} = await launch([...prefix, 'python3', SECURITY_CONTEXT, path, FLATPAK, appId],
    {env: through(socket), label: 'the sandbox engine connects'});
  return {process, socket: path, listening: lines[0] === 'listening'};
}
