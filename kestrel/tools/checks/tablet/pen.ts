import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {withApp} from '../apps/lib/apps.js';
import {withScheme, type Scheme} from '../apps/lib/palette.js';
import {show} from '../apps/settings/navigation.js';
import {named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {property} from '../lib/dbus.js';
import {penTap} from '../lib/input/penStroke.js';
import {pause, settled} from '../lib/wait.js';
import {BTN_STYLUS2, hover, leave, pen, pressButton} from './lib/pen.js';

const {require, eventually} = checks('pen');
const SCHEMES: Scheme[] = ['light', 'dark'];

const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const penSettings = new Gio.Settings({schema_id: 'com.lantharos.kestrel.pen'});
const start = () => named('kestrel-start');
const listed = () => property<[string, string, string][]>('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Pens', 'com.lantharos.Kestrel.Pens', 'Devices');

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

/** Taps the moment the pen appears, before Kestrel has heard of it, as a pen held near the screen does when it comes back on resume. */
async function writeAtOnce() {
  let tapped = false;
  const filter = Clutter.Event.prepend_filter(null, event => {
    if (event.type() === Clutter.EventType.BUTTON_PRESS && event.get_device_tool()) tapped = true;
    return Clutter.EVENT_PROPAGATE;
  });
  try {
    await penTap([700, 450]);
    require(tapped, 'a pen that taps the moment it appears reaches the desktop');
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
  await writeAtOnce();
  await eventually(async () => (await listed()).some(([, , kind]) => kind === 'screen'), 'Kestrel lists the virtual pen as a pen on the screen');
  await checkEraserButton();
  await checkStartButton();
  await withApp('settings', [], async app => {
    for (const scheme of SCHEMES) await withScheme(scheme, async () => (await show(app, 'pen')).save(`settings-pen-${scheme}`));
  });
  await withSquareCorners(() => withApp('settings', [], async app => (await show(app, 'pen')).save('settings-pen-square')));
}
