import type Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {existing, firstStyled, named, ofType, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {centerOf, moveTo, rest} from '../lib/input/input.js';
import {gjs, spawn, stop, waitForWindow, waitForWindows} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled, waitUntil} from '../lib/wait.js';

const {require, eventually} = checks('taskbar');
const TITLES = ['Kestrel window check 1', 'Kestrel window check 2'];

const launcherEntry = (appId: string) => `
  const {Gio, GLib} = imports.gi;
  Gio.DBus.session.emit_signal(null, '/check', 'com.canonical.Unity.LauncherEntry', 'Update',
    new GLib.Variant('(sa{sv})', ['application://${appId}', {
      'count': new GLib.Variant('x', 3), 'count-visible': new GLib.Variant('b', true),
      'progress': new GLib.Variant('d', 0.5), 'progress-visible': new GLib.Variant('b', true),
      'urgent': new GLib.Variant('b', true),
    }]));
  new GLib.MainLoop(null, false).run();`;

async function appButton(panel: Clutter.Actor, window: Meta.Window) {
  const app = Shell.WindowTracker.get_default().get_window_app(window);
  return {app, button: ofType(await waitUntil(() => named(`kestrel-app-${app.id}`, panel), 'the app gets a taskbar button'), St.Button)};
}

async function checkIndicators(panel: Clutter.Actor, window: Meta.Window) {
  const {app, button} = await appButton(panel, window);
  const launcher = spawn(['gjs', '-c', launcherEntry(app.id)]);
  const badge = ofType(firstStyled('kestrel-task-badge', button), St.Label);
  const fill = ofType(firstStyled('kestrel-task-progress-fill', button), St.Widget);
  await eventually(() => badge.visible && badge.text === '3', 'apps show their unread count');
  await eventually(() => fill.get_parent()!.visible && Math.abs(fill.width - fill.get_parent()!.width / 2) <= 1, 'apps show their progress');
  await eventually(() => ofType(firstStyled('kestrel-task-attention', button), St.Widget).visible, 'apps asking for attention are highlighted');
  await capture('taskbar-indicators');
  await stop(launcher);
  await eventually(() => !badge.visible, 'indicators clear when the app exits');
}

async function checkPeek(panel: Clutter.Actor, windows: Meta.Window[]) {
  const peek = ofType(firstStyled('kestrel-peek', panel), St.Button);
  const actors = windows.map(window => window.get_compositor_private<Meta.WindowActor>());
  moveTo(centerOf(peek));
  await eventually(() => actors.every(actor => actor.opacity === 0), 'hovering the panel edge peeks at the desktop');
  rest();
  await eventually(() => actors.every(actor => actor.opacity === 255), 'leaving the edge brings windows back');
  peek.emit('clicked', 1);
  await eventually(() => windows.every(window => window.minimized), 'clicking the edge shows the desktop');
  peek.emit('clicked', 1);
  await eventually(() => windows.every(window => !window.minimized), 'clicking again restores the windows');
}

async function checkFullscreen(panel: Clutter.Actor, window: Meta.Window) {
  window.activate(global.get_current_time());
  window.make_fullscreen();
  await eventually(() => window.is_fullscreen() && !panel.visible, 'the taskbar stays below fullscreen windows');
  await capture('fullscreen');
  window.unmake_fullscreen();
  await eventually(() => !window.is_fullscreen() && panel.visible, 'the taskbar returns after fullscreen');
}

async function checkFocus(panel: Clutter.Actor, window: Meta.Window) {
  const {button} = await appButton(panel, window);
  await eventually(() => button.has_style_class_name('kestrel-app-focused'), 'the focused app keeps its focus styling');
  const [hasIconGeometry, iconGeometry] = window.get_icon_geometry();
  const [buttonX, buttonY] = button.get_transformed_position();
  require(hasIconGeometry && iconGeometry.x === Math.round(buttonX) && iconGeometry.y === Math.round(buttonY),
    'windows minimize toward their taskbar button');
  window.minimize();
  await waitUntil(() => window.minimized, 'the window minimizes');
  window.activate(global.get_current_time());
  await eventually(() => button.has_style_class_name('kestrel-app-focused'), 'app focus styling returns after minimize and activation');
  const dots = button.child.get_children().filter(actor => actor instanceof St.Widget && actor.has_style_class_name('kestrel-running-dot') && actor.visible);
  require(dots.length === 2, 'two app windows show two running dots');

  const [x, y] = button.get_transformed_position();
  moveTo([x + 20, y + 20]);
  await eventually(() => existing('kestrel-window-previews').visible, 'hovering a taskbar button opens live window previews');
  await capture('window-previews');
  dismissImmediately();
  rest();
}

async function checkOpening(panel: Clutter.Actor) {
  const center = existing('kestrel-panel-center');
  const widths = new Set([center.width]);
  const sample = global.stage.connect('after-paint', () => widths.add(center.width));
  const app = gjs('clients/windows/window.js');
  try {
    const window = await waitForWindow('Kestrel window check');
    await settled();
    await capture('window');
    require(widths.size > 2, 'the taskbar animates its width as a window opens');

    toggleSurface('start');
    await eventually(() => shown(named('kestrel-start')), 'Start opens over a window');
    await capture('start-over-window');
    toggleSurface('start');
    await eventually(() => !existing('kestrel-start').visible, 'Start closes again');

    window.maximize();
    await eventually(() => window.is_maximized(), 'the window maximizes');
    await settled();
    await capture('window-maximized');
    const frame = window.get_frame_rect();
    require(frame.y + frame.height <= panel.get_transformed_position()[1], 'a maximized window stays clear of the taskbar');
  } finally {
    await stop(app);
    global.stage.disconnect(sample);
  }
}

export async function run() {
  const panel = existing('kestrel-panel');
  await checkOpening(panel);
  const app = gjs('clients/windows/window.js', ['--multiple']);
  const windows = await waitForWindows(TITLES);
  await checkIndicators(panel, windows[0]);
  await checkPeek(panel, windows);
  await checkFullscreen(panel, windows[0]);
  await checkFocus(panel, windows[0]);
  await stop(app);
}
