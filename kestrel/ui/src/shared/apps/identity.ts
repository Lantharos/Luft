import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import { readProcFile } from '../dbus/processes.js';

const MAX_LINKS = 40;
const FURTHEST_LAUNCHER = 8;
const FIELD_CODE = /^%[a-zA-Z]$/;
const SHELLS = new Set(['bash', 'sh', 'zsh', 'fish', 'dash', 'env', 'nohup', 'timeout', 'sudo']);

export type Identity = { app: string } | { program: string };

export function identifyProcess(pid: number): Identity | null {
  if (pid <= 0) return null;
  const [judged, app, program] = Meta.process_identify_pid(pid);
  if (!judged) return null;
  return app ? { app } : { program: program! };
}

function realPath(path: string): string {
  for (let links = 0; links < MAX_LINKS && GLib.file_test(path, GLib.FileTest.IS_SYMLINK); links++)
    path = GLib.canonicalize_filename(GLib.file_read_link(path), GLib.path_get_dirname(path));
  return path;
}

function launchesSomethingElse(info: Gio.AppInfo): boolean {
  const [, argv] = GLib.shell_parse_argv(info.get_commandline()!);
  return argv!.slice(1).some(argument => !FIELD_CODE.test(argument));
}

let appIdsByProgram: Map<string, string> | null = null;

function installedPrograms(appSystem: Shell.AppSystem): Map<string, string> {
  const runs = new Map<string, string>();
  const launchers = new Map<string, string[]>();
  for (const info of appSystem.get_installed()) {
    const name = info.get_executable();
    const executable = name && GLib.find_program_in_path(name);
    const program = executable && realPath(executable);
    if (!program) continue;
    if (!launchesSomethingElse(info)) {
      if (!runs.has(program)) runs.set(program, info.get_id()!);
    } else {
      launchers.set(program, [...(launchers.get(program) ?? []), info.get_id()!]);
    }
  }
  for (const [program, ids] of launchers)
    if (ids.length === 1 && !runs.has(program)) runs.set(program, ids[0]);
  return runs;
}

function appRunning(program: string): Shell.App | null {
  const appSystem = Shell.AppSystem.get_default();
  if (!appIdsByProgram) {
    appSystem.connect('installed-changed', () => (appIdsByProgram = null));
    appIdsByProgram = installedPrograms(appSystem);
  }
  const id = appIdsByProgram.get(program);
  return id ? appSystem.lookup_app(id) : null;
}

export interface VerifiedApp {
  name: string;
  app: Shell.App | null;
}

export function verifiedApp(identity: Identity): VerifiedApp {
  if ('app' in identity) {
    const app = Shell.AppSystem.get_default().lookup_app(`${identity.app}.desktop`);
    return { name: app?.get_name() ?? identity.app, app };
  }
  const app = appRunning(identity.program);
  return { name: app?.get_name() ?? GLib.path_get_basename(identity.program), app };
}

export function verifiedName(pid: number): string | null {
  const identity = identifyProcess(pid);
  return identity && verifiedApp(identity).name;
}

function parentOf(pid: number): number | null {
  const stat = readProcFile(`/proc/${pid}/stat`);
  const parent = Number(stat?.slice(stat.lastIndexOf(') ') + 2).split(' ')[1]);
  return parent > 1 ? parent : null;
}

export function* launchers(pid: number): Generator<VerifiedApp> {
  for (let current = parentOf(pid), steps = 0; current && steps < FURTHEST_LAUNCHER; current = parentOf(current), steps++) {
    const identity = identifyProcess(current);
    if (!identity) return;
    if ('program' in identity && SHELLS.has(GLib.path_get_basename(identity.program))) continue;
    yield verifiedApp(identity);
  }
}

export function launchingApp(pid: number): VerifiedApp | null {
  for (const launcher of launchers(pid)) if (launcher.app) return launcher;
  return null;
}
