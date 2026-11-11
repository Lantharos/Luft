import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import {builtFixture} from '../../lib/processes.js';
import {waitUntil} from '../../lib/wait.js';

export interface TestApp {
  id: string;
  name: string;
  windows: number;
  x11?: boolean;
}

export const NOTEBOOK: TestApp = {id: 'com.lantharos.KestrelChecks.Notebook', name: 'Notebook', windows: 2};
export const SKETCH: TestApp = {id: 'com.lantharos.KestrelChecks.Sketch', name: 'Sketch', windows: 1};
export const LEDGER: TestApp = {id: 'com.lantharos.KestrelChecks.Ledger', name: 'Ledger', windows: 1, x11: true};
export const GONE: TestApp = {id: 'com.lantharos.KestrelChecks.Gone', name: 'Gone', windows: 1};
export const STARTUP: TestApp = {id: 'com.lantharos.KestrelChecks.Startup', name: 'Startup', windows: 1};

const OPEN_TIMEOUT = 20000;
const X11_CLASS = 'KestrelChecksLedger';
const entryName = (app: TestApp) => `${app.id}.desktop`;
const entryIn = (folder: string, app: TestApp) => GLib.build_filenamev([folder, entryName(app)]);
const applications = () => GLib.build_filenamev([GLib.get_user_data_dir(), 'applications']);
const autostart = () => GLib.build_filenamev([GLib.get_user_config_dir(), 'autostart']);

function command(app: TestApp): string {
  const gjs = (client: string) => `env GSK_RENDERER=cairo gjs -m ${builtFixture('clients', ...client.split('/'))}`;
  if (app.x11) return `${gjs('x11/x11Window.js')} "${app.name} 1" "#3a5f8a" "" ${X11_CLASS}`;
  return `${gjs('restore/notebook.js')} ${app.id} ${app.name} ${app.windows}`;
}

function entry(app: TestApp): string {
  const lines = ['[Desktop Entry]', 'Type=Application', `Name=${app.name}`, `Exec=${command(app)}`, 'Icon=application-x-executable', 'StartupNotify=true'];
  if (app.x11) lines.push(`StartupWMClass=${X11_CLASS}`);
  return `${lines.join('\n')}\n`;
}

export async function install(...apps: TestApp[]): Promise<void> {
  GLib.mkdir_with_parents(applications(), 0o755);
  for (const app of apps) GLib.file_set_contents(entryIn(applications(), app), entry(app));
  await waitUntil(() => apps.every(app => Shell.AppSystem.get_default().lookup_app(entryName(app))), 'the test apps are installed');
}

export function uninstall(...apps: TestApp[]): void {
  for (const app of apps) {
    for (const folder of [applications(), autostart()]) GLib.unlink(entryIn(folder, app));
  }
}

export function startsBySignIn(app: TestApp): void {
  GLib.mkdir_with_parents(autostart(), 0o755);
  GLib.file_set_contents(entryIn(autostart(), app), entry(app));
}

const managed = (): Meta.Window[] => global.display.list_all_windows().filter(window => window.get_compositor_private());

export const windowsOf = (app: TestApp): Meta.Window[] =>
  managed().filter(window => Shell.WindowTracker.get_default().get_window_app(window)?.get_id() === entryName(app));

export const titled = (title: string): Meta.Window | null => managed().find(window => window.get_title() === title) ?? null;

export const processesOf = (app: TestApp) => new Set(windowsOf(app).map(window => window.get_pid() as number));

export async function open(app: TestApp): Promise<Meta.Window[]> {
  Shell.AppSystem.get_default().lookup_app(entryName(app))!.activate();
  return waitUntil(() => windowsOf(app).length === app.windows && windowsOf(app), `${app.name} opens`, OPEN_TIMEOUT);
}

export function quit(...apps: TestApp[]): void {
  for (const pid of apps.flatMap(app => [...processesOf(app)])) Gio.Subprocess.new(['kill', String(pid)], Gio.SubprocessFlags.NONE);
}
