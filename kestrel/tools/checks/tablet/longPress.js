import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {named, shown, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {centerOf, type} from '../lib/input/input.js';
import {gjs, stop} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {tap, touchDown, touchMove, touchUp} from './lib/touch.js';

const {require, eventually} = checks('long press');
const FILE_MANAGER = 'com.lantharos.rover.desktop';
const HELD = global.stage.context.get_settings().long_press_duration + 150;
const SHORT = 120;
const QUIET = 600;

const menu = () => named('kestrel-context-menu');
const panel = () => named('kestrel-panel');
const start = () => named('kestrel-start');
const quick = () => named('kestrel-quick-settings');
const cue = () => named('kestrel-hold-cue');
const offers = label => menu().visible && shown(named(label, menu()));
const tile = title => styled('kestrel-control', quick()).find(control => control.title === title);
const rover = () => Shell.AppSystem.get_default().lookup_app(FILE_MANAGER);

async function hold(point, label, entry) {
  touchDown(point);
  await pause(HELD / 2);
  require(cue()?.visible && cue().opacity > 0, `holding ${label} shows the hold cue under the finger`);
  await eventually(() => offers(entry), `holding ${label} opens its menu before the finger lifts`, HELD);
  touchUp();
  await pause(QUIET);
  require(offers(entry), `lifting the finger after holding ${label} keeps its menu open`);
  require(!cue().visible, 'the hold cue fades once the menu opens');
}

async function dismissByTap() {
  await tap([20, 20]);
  await eventually(() => !menu().visible, 'tapping outside a menu closes it');
  await settled();
}

async function notify(title) {
  await call('org.gnome.Shell', '/org/freedesktop/Notifications', 'org.freedesktop.Notifications', 'Notify',
    new GLib.Variant('(susssasa{sv}i)', ['Chatter', 0, '', title, 'Hold this', [], {
      'x-shell-sender': new GLib.Variant('s', Gio.DBus.session.get_unique_name()),
    }, -1]), '(u)');
}

async function checkShortPress(point) {
  touchDown(point);
  await pause(SHORT);
  touchUp();
  await pause(HELD);
  require(!menu().visible && !cue().visible, 'a quick tap on the taskbar opens no menu and leaves no cue');
}

async function checkTaskbar(settings) {
  const favorites = settings.get_strv('favorite-apps');
  const button = named('Rover', panel());
  await hold(centerOf(button), 'a pinned app', 'Unpin from taskbar');
  require(rover().state === Shell.AppState.STOPPED, 'holding an app does not also open it');
  await dismissByTap();

  const [x, y] = centerOf(button);
  touchDown([x, y]);
  await pause(SHORT);
  await touchMove([x, y], [x + 160, y], 10);
  await eventually(() => button.opacity < 255, 'a finger still drags a pinned app');
  require(!menu().visible, 'dragging an app opens no menu');
  touchUp();
  await eventually(() => button.opacity === 255, 'the drag ends when the finger lifts');
  settings.set_strv('favorite-apps', favorites);
  await settled();

  const [panelX, panelY] = panel().get_transformed_position();
  const middle = panelY + panel().height / 2;
  const empty = [...Array(Math.floor(panel().width / 8)).keys()].map(step => [panelX + step * 8, middle])
    .find(point => global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, ...point) === panel());
  require(empty, 'the taskbar has empty space to hold');
  await hold(empty, 'the taskbar', 'Taskbar settings');
  await capture('long-press-taskbar');
  await dismissByTap();
  await checkShortPress(empty);
}

async function checkDesktop() {
  await hold([Main.layoutManager.primaryMonitor.width / 2, 120], 'the desktop', 'Change wallpaper');
  await dismissByTap();
}

async function checkStart() {
  await tap(centerOf(named('Start', panel())));
  await eventually(() => shown(start()), 'tapping Start opens it');
  await settled();
  const app = styled('kestrel-app-button', start()).find(button => button.mapped && button.name.endsWith('.desktop'));
  const shellApp = Shell.AppSystem.get_default().lookup_app(app.name.replace('kestrel-start-item-', ''));
  await hold(centerOf(app), 'an app in Start', 'Open');
  require(shown(start()) && shellApp.state === Shell.AppState.STOPPED, 'holding an app in Start leaves Start open without opening the app');
  await capture('long-press-start');
  await dismissByTap();
  if (!shown(start())) toggleSurface('start');
  await eventually(() => shown(start()), 'Start is open for searching');
  type('files');
  await eventually(() => named('Rover', start())?.mapped && named('Rover', start()) !== app, 'searching finds Rover');
  await settled();
  await hold(centerOf(named('Rover', start())), 'a search result', 'Open');
  await dismissByTap();
  dismissImmediately();
}

async function checkNotifications() {
  await notify('Hold me');
  dismissImmediately();
  toggleSurface('notifications');
  const center = named('kestrel-notifications');
  await eventually(() => shown(center) && named('Hold me', center)?.mapped, 'the notification center shows the notification');
  await settled();
  await hold(centerOf(named('Hold me', center)), 'a notification', 'Open');
  await dismissByTap();
  dismissImmediately();
}

async function checkQuickSettings(settings) {
  const sensor = gjs('services/sensorProxy.js');
  try {
    settings.set_strv('quick-tiles-removed', ['screenshot', 'settings', 'lock']);
    toggleSurface('quick');
    await eventually(() => shown(quick()) && tile('Auto Rotate')?.visible, 'the rotation tile shows on a computer with an accelerometer');
    await settled();
    const dark = tile('Dark Style');
    const checked = dark.checked;
    await hold(centerOf(dark), 'a quick setting', 'Remove');
    require(dark.checked === checked, 'holding a tile does not also toggle it');
    await dismissByTap();
    if (!shown(quick())) toggleSurface('quick');
    await eventually(() => shown(quick()), 'quick settings are open again');
    await settled();
    await tap(centerOf(dark));
    await eventually(() => dark.checked !== checked, 'tapping a tile still toggles it');
    await tap(centerOf(dark));
    await eventually(() => dark.checked === checked, 'and tapping again toggles it back');
    await settled();
    await hold(centerOf(tile('Auto Rotate')), 'the rotation tile', 'Settings');
    await capture('long-press-quick-tile');
    await dismissByTap();
  } finally {
    dismissImmediately();
    settings.reset('quick-tiles-removed');
    await stop(sensor);
  }
}

export async function run() {
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  await settled();
  await checkTaskbar(settings);
  await checkDesktop();
  await checkStart();
  await checkNotifications();
  await checkQuickSettings(settings);
}
