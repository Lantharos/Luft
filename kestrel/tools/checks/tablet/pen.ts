import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {withApp} from '../apps/lib/apps.js';
import {withScheme, type Scheme} from '../apps/lib/palette.js';
import {show} from '../apps/settings/navigation.js';
import {named, shown, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {property} from '../lib/dbus.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {BTN_STYLUS2, hover, leave, pen, pressButton} from './lib/pen.js';

const {require, eventually} = checks('pen');
const SCHEMES: Scheme[] = ['light', 'dark'];

const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const penSettings = new Gio.Settings({schema_id: 'com.lantharos.kestrel.pen'});
const quick = () => named('kestrel-quick-settings');
const start = () => named('kestrel-start');
const penTile = () => styled('kestrel-control', quick()!).find((tile): tile is St.Button => tile instanceof St.Button && tile.accessible_name === 'Pen');
const listed = () => property<[string, string, string][]>('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Pens', 'com.lantharos.Kestrel.Pens', 'Devices');

async function captureTile(name: string) {
  toggleSurface('quick');
  await eventually(() => shown(quick()) && penTile()?.visible, 'quick settings show a Pen tile while a pen is connected');
  const subtitle = styled('kestrel-control-subtitle', penTile()!)[0] as St.Label;
  require(subtitle.text.endsWith(penSettings.get_string('hand') === 'left' ? 'Left hand' : 'Right hand'), 'the Pen tile says which hand writes');
  await capture(name);
  dismissImmediately();
  await settled();
}

async function checkStartButton() {
  penSettings.set_string('secondary-button-action', 'start');
  try {
    hover([700, 450]);
    await pressButton(BTN_STYLUS2);
    await eventually(() => shown(start()), 'the upper pen button opens Start when it is set to');
    await pressButton(BTN_STYLUS2);
    await eventually(() => !shown(start()), 'pressing it again closes Start');
    leave();
  } finally {
    penSettings.reset('secondary-button-action');
  }
}

async function checkEraserButton() {
  const tools: Clutter.InputDeviceToolType[] = [];
  const filter = Clutter.Event.prepend_filter(null, event => {
    if (event.type() === Clutter.EventType.PROXIMITY_IN) tools.push(event.get_device_tool()!.get_tool_type());
    return Clutter.EVENT_PROPAGATE;
  });
  try {
    hover([700, 450]);
    await eventually(() => tools.at(-1) === Clutter.InputDeviceToolType.PEN, 'the pen comes near as a pen');
    pen().notify_tablet_button(GLib.get_monotonic_time(), BTN_STYLUS2, Clutter.ButtonState.PRESSED);
    await eventually(() => tools.at(-1) === Clutter.InputDeviceToolType.ERASER, 'holding the upper button turns the pen into an eraser');
    await pause(100);
    pen().notify_tablet_button(GLib.get_monotonic_time(), BTN_STYLUS2, Clutter.ButtonState.RELEASED);
    await eventually(() => tools.at(-1) === Clutter.InputDeviceToolType.PEN, 'letting go makes it a pen again');
    leave();
  } finally {
    Clutter.Event.remove_filter(filter);
  }
}

async function withSquareCorners(action: () => Promise<void>) {
  kestrel.set_boolean('rounded-window-corners', false);
  try {
    await settled();
    await action();
  } finally {
    kestrel.reset('rounded-window-corners');
  }
}

export async function run() {
  pen();
  await eventually(async () => (await listed()).some(([, , kind]) => kind === 'screen'), 'Kestrel lists the virtual pen as a pen on the screen');
  await checkEraserButton();
  await checkStartButton();
  for (const scheme of SCHEMES) await withScheme(scheme, () => captureTile(`pen-tile-${scheme}`));
  penSettings.set_string('hand', 'left');
  try {
    await captureTile('pen-tile-left-hand');
  } finally {
    penSettings.reset('hand');
  }
  await withApp('settings', [], async app => {
    for (const scheme of SCHEMES) await withScheme(scheme, async () => (await show(app, 'pen')).save(`settings-pen-${scheme}`));
  });
  await withSquareCorners(() => withApp('settings', [], async app => (await show(app, 'pen')).save('settings-pen-square')));
  await withSquareCorners(() => captureTile('pen-tile-square'));
}
