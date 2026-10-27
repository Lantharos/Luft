import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {fixture, outputLines, scratch, spawn, stop, type Process} from '../processes.js';
import {waitUntil} from '../wait.js';

const SECURITY_CONTEXT = fixture('clients', 'wayland', 'securityContext.py');
const FLATPAK = 'org.flatpak';
let contexts = 0;

export const SANDBOXED_APP = 'com.lantharos.KestrelChecks.Sandboxed';

export const through = (socket: string | null): Record<string, string> => socket ? {WAYLAND_DISPLAY: socket} : {};

const linkTarget = (path: string) => GLib.file_test(path, GLib.FileTest.IS_SYMLINK) ? GLib.file_read_link(path) : path;

export function bubblewrapped(appId: string, binds = ['--ro-bind', fixture('clients'), fixture('clients')]) {
  const info = scratch(`flatpak-info-${appId}`);
  GLib.file_set_contents(info, `[Application]\nname=${appId}\n`);
  const runtime = GLib.get_user_runtime_dir();
  return ['bwrap', '--die-with-parent', '--ro-bind', '/usr', '/usr',
    '--symlink', 'usr/bin', '/bin', '--symlink', 'usr/sbin', '/sbin', '--symlink', 'usr/lib', '/lib', '--symlink', 'usr/lib64', '/lib64',
    '--proc', '/proc', '--dev', '/dev', '--bind', runtime, runtime, ...binds, '--ro-bind', info, '/.flatpak-info'];
}

export function onSessionBus(appId: string) {
  const bus = GLib.getenv('DBUS_SESSION_BUS_ADDRESS')!.replace(/^unix:path=/, '').split(',')[0];
  const folder = GLib.path_get_dirname(linkTarget(bus));
  return bubblewrapped(appId, ['--ro-bind', '/etc', '/etc', '--bind', folder, folder]);
}

export const inAppScope = (appId: string, argv: string[]) =>
  ['systemd-run', '--user', '--scope', '--quiet', '--collect', `--unit=app-${appId}-${GLib.random_int()}.scope`, ...argv];

export interface Launched {
  process: Process;
  lines: string[];
}

export async function launch(argv: string[], {env = {}, label}: {env?: Record<string, string>; label: string}): Promise<Launched> {
  const process = spawn(argv, {env, flags: Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE});
  const lines = outputLines(process);
  await waitUntil(() => lines.length > 0, label);
  return {process, lines};
}

export interface SecurityContextOptions {
  prefix?: string[];
  socket?: string | null;
}

export async function openSecurityContext(appId: string, {prefix = [], socket = null}: SecurityContextOptions = {}) {
  const path = scratch(`sandbox-${++contexts}`);
  const {process, lines} = await launch([...prefix, 'python3', SECURITY_CONTEXT, path, FLATPAK, appId],
    {env: through(socket), label: 'the sandbox engine connects'});
  return {process, socket: path, listening: lines[0] === 'listening'};
}

export async function sandboxedApp(talk: string, {own = null}: {own?: string | null} = {}) {
  const socket = scratch(`sandbox-bus-${++contexts}`);
  GLib.unlink(socket);
  const cache = linkTarget(GLib.get_user_cache_dir());
  const proxy = spawn([
    ...bubblewrapped(SANDBOXED_APP, ['--unshare-pid', '--ro-bind', '/etc', '/etc', '--bind', '/tmp', '/tmp', '--bind', cache, cache]),
    'xdg-dbus-proxy', GLib.getenv('DBUS_SESSION_BUS_ADDRESS')!, socket, '--filter', `--talk=${talk}`,
    ...own ? [`--own=${own}`] : [],
  ]);
  await waitUntil(() => GLib.file_test(socket, GLib.FileTest.EXISTS), `a sandboxed app that may talk to ${talk} starts`, 10000);
  const connection = Gio.DBusConnection.new_for_address_sync(`unix:path=${socket}`,
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
  return {
    connection,
    call(path: string, iface: string, method: string, parameters: GLib.Variant | null = null, replyType: string | null = null) {
      return connection.call(talk, path, iface, method, parameters, replyType ? new GLib.VariantType(replyType) : null, Gio.DBusCallFlags.NONE, 5000, null);
    },
    async close() {
      connection.close_sync(null);
      await stop(proxy);
    },
  };
}
