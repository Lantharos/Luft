import Shell from 'gi://Shell';
import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {descendants, firstStyled, named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {centerOf, moveTo, rest} from '../lib/input.js';
import {gjs, spawn, stop, waitForWindow, waitForWindows} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled, waitUntil} from '../lib/wait.js';

const {require, eventually} = checks('taskbar');
const TITLES = ['Kestrel window check 1', 'Kestrel window check 2'];

const launcherEntry = appId => `
  const {Gio, GLib} = imports.gi;
  Gio.DBus.session.emit_signal(null, '/check', 'com.canonical.Unity.LauncherEntry', 'Update',
    new GLib.Variant('(sa{sv})', ['application://${appId}', {
      'count': new GLib.Variant('x', 3), 'count-visible': new GLib.Variant('b', true),
      'progress': new GLib.Variant('d', 0.5), 'progress-visible': new GLib.Variant('b', true),
      'urgent': new GLib.Variant('b', true),
    }]));
  new GLib.MainLoop(null, false).run();`;

async function checkIndicators(panel) {
  const button = descendants(panel).find(actor => actor.name?.startsWith('kestrel-app-'));
  const launcher = spawn(['gjs', '-c', launcherEntry(button.name.replace('kestrel-app-', ''))]);
  const badge = firstStyled('kestrel-task-badge', button);
  const fill = firstStyled('kestrel-task-progress-fill', button);
  await eventually(() => badge.visible && badge.text === '3', 'apps show their unread count');
  await eventually(() => fill.get_parent().visible && Math.abs(fill.width - fill.get_parent().width / 2) <= 1, 'apps show their progress');
  await eventually(() => firstStyled('kestrel-task-attention', button).visible, 'apps asking for attention are highlighted');
  await capture('taskbar-indicators');
  await stop(launcher);
  await eventually(() => !badge.visible, 'indicators clear when the app exits');
}

async function checkPeek(panel, windows) {
  const peek = firstStyled('kestrel-peek', panel);
  const actors = windows.map(window => window.get_compositor_private());
  moveTo(centerOf(peek));
  await eventually(() => actors.every(actor => actor.opacity === 0), 'hovering the panel edge peeks at the desktop');
  rest();
  await eventually(() => actors.every(actor => actor.opacity === 255), 'leaving the edge brings windows back');
  peek.emit('clicked', 1);
  await eventually(() => windows.every(window => window.minimized), 'clicking the edge shows the desktop');
  peek.emit('clicked', 1);
  await eventually(() => windows.every(window => !window.minimized), 'clicking again restores the windows');
}

async function checkFullscreen(panel, window) {
  window.activate(global.get_current_time());
  window.make_fullscreen();
  await eventually(() => window.is_fullscreen() && !panel.visible, 'the taskbar stays below fullscreen windows');
  await capture('fullscreen');
  window.unmake_fullscreen();
  await eventually(() => !window.is_fullscreen() && panel.visible, 'the taskbar returns after fullscreen');
}

async function checkFocus(panel, window) {
  const app = Shell.WindowTracker.get_default().get_window_app(window);
  const button = named(`kestrel-app-${app.id}`, panel);
  await eventually(() => button.has_style_class_name('kestrel-app-focused'), 'the focused app keeps its focus styling');
  const [hasIconGeometry, iconGeometry] = window.get_icon_geometry();
  const [buttonX, buttonY] = button.get_transformed_position();
  require(hasIconGeometry && iconGeometry.x === Math.round(buttonX) && iconGeometry.y === Math.round(buttonY),
    'windows minimize toward their taskbar button');
  window.minimize();
  await waitUntil(() => window.minimized, 'the window minimizes');
  window.activate(global.get_current_time());
  await eventually(() => button.has_style_class_name('kestrel-app-focused'), 'app focus styling returns after minimize and activation');
  const dots = button.child.get_children().filter(actor => actor.has_style_class_name?.('kestrel-running-dot') && actor.visible);
  require(dots.length === 2, 'two app windows show two running dots');

  const [x, y] = button.get_transformed_position();
  moveTo([x + 20, y + 20]);
  await eventually(() => named('kestrel-window-previews').visible, 'hovering a taskbar button opens live window previews');
  await capture('window-previews');
  dismissImmediately();
  rest();
}

async function checkOpening(panel) {
  const center = named('kestrel-panel-center');
  const widths = new Set([center.width]);
  const sample = global.stage.connect('after-paint', () => widths.add(center.width));
  const app = gjs('clients/window.js');
  try {
    const window = await waitForWindow('Kestrel window check');
    await settled();
    await capture('window');
    require(widths.size > 2, 'the taskbar animates its width as a window opens');

    toggleSurface('start');
    await eventually(() => shown(named('kestrel-start')), 'Start opens over a window');
    await capture('start-over-window');
    toggleSurface('start');
    await eventually(() => !named('kestrel-start').visible, 'Start closes again');

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
  const panel = named('kestrel-panel');
  await checkOpening(panel);
  const app = gjs('clients/window.js', ['--multiple']);
  const windows = await waitForWindows(TITLES);
  await checkIndicators(panel);
  await checkPeek(panel, windows);
  await checkFullscreen(panel, windows[0]);
  await checkFocus(panel, windows[0]);
  await stop(app);
}
