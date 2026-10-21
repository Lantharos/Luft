import Shell from 'gi://Shell';

import {named} from '../../lib/actors.js';
import {gjs, spawn, stop, waitForWindows} from '../../lib/processes.js';
import {dots, eventually, otherMonitor, panel, primary, set, shownOn} from './taskbar.js';

const SECOND_APP = `
  imports.gi.versions.Gtk = '4.0';
  const {Gtk} = imports.gi;
  const app = new Gtk.Application({application_id: 'com.lantharos.Kestrel.WorkspaceCheck'});
  app.connect('activate', () => new Gtk.ApplicationWindow({application: app, title: 'Kestrel workspace check'}).present());
  app.run([]);`;

const manager = global.workspace_manager;
const activate = index => manager.get_workspace_by_index(index).activate(global.get_current_time());

async function checkPerDisplay(windows, apps) {
  const [, , lone] = windows;
  const [app, loneApp] = apps;
  set('taskbar-windows-per-display', true);
  const secondary = named('kestrel-secondary-panel');
  lone.move_to_monitor(otherMonitor().index);
  await eventually(() => !shownOn(panel(), loneApp) && shownOn(secondary, loneApp) && !shownOn(secondary, app),
    'each display lists only its own windows on the current workspace');
  activate(0);
  await eventually(() => dots(shownOn(panel(), app)) === 1 && !shownOn(secondary, app) && shownOn(secondary, loneApp),
    'switching workspaces keeps each display to its own windows, and windows on other displays show on every workspace');
  set('taskbar-windows-per-display', false);
}

export async function checkWorkspaceWindows() {
  const processes = [gjs('clients/window.js', ['--multiple']), spawn(['gjs', '-c', SECOND_APP])];
  const windows = await waitForWindows(['Kestrel window check 1', 'Kestrel window check 2', 'Kestrel workspace check']);
  const [first, other, lone] = windows;
  for (const window of windows) window.move_to_monitor(primary().index);
  const tracker = Shell.WindowTracker.get_default();
  const app = tracker.get_window_app(first);
  const loneApp = tracker.get_window_app(lone);
  other.change_workspace_by_index(1, false);
  lone.change_workspace_by_index(1, false);
  await eventually(() => dots(shownOn(panel(), app)) === 2 && shownOn(panel(), loneApp), 'the taskbar lists windows from every workspace by default');

  set('taskbar-windows-per-workspace', true);
  await eventually(() => dots(shownOn(panel(), app)) === 1 && !shownOn(panel(), loneApp), 'the taskbar can list only the windows on the current workspace');
  activate(1);
  await eventually(() => dots(shownOn(panel(), app)) === 1 && shownOn(panel(), loneApp), 'switching workspaces lists that workspace\'s windows');
  lone.change_workspace_by_index(0, false);
  await eventually(() => !shownOn(panel(), loneApp), 'moving a window to another workspace takes it off the taskbar');
  lone.change_workspace_by_index(1, false);
  await eventually(() => shownOn(panel(), loneApp), 'moving a window here puts it on the taskbar');

  if (otherMonitor()) await checkPerDisplay(windows, [app, loneApp]);
  activate(0);
  set('taskbar-windows-per-workspace', false);
  await eventually(() => dots(shownOn(panel(), app)) === 2 && shownOn(panel(), loneApp), 'turning it off lists every workspace again');
  await Promise.all(processes.map(stop));
}
