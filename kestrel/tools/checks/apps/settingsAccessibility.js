import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {LuftApp, sleep, waitFor} from './luftApp.js';

const LOADING = 600;
const SWITCH_X = 959;
const TYPING_ASSIST = [SWITCH_X, 582];
const SWITCHES = [
  {name: 'reduce-animations', y: 349, schema: 'org.gnome.desktop.interface', key: 'enable-animations', on: value => !value.get_boolean()},
  {name: 'high-contrast', y: 293, schema: 'org.gnome.desktop.a11y.interface', key: 'high-contrast', on: value => value.get_boolean()},
  {name: 'large-text', y: 237, schema: 'org.gnome.desktop.interface', key: 'text-scaling-factor', on: value => value.get_double() > 1},
  {name: 'sticky-keys', y: 638, schema: 'org.gnome.desktop.a11y.keyboard', key: 'stickykeys-enable', on: value => value.get_boolean(), expand: true},
];

function press(app, pointer, [x, y]) {
  const frame = app.window.get_frame_rect();
  pointer.notify_absolute_motion(GLib.get_monotonic_time(), frame.x + x, frame.y + y);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
}

async function toggle(app, {name, y, schema, key, on, expand}, {pointer, require, output}) {
  const settings = new Gio.Settings({schema_id: schema});
  require(!on(settings.get_value(key)), `${name} starts off`);
  if (expand) {
    press(app, pointer, TYPING_ASSIST);
    await sleep(LOADING);
  }
  press(app, pointer, [SWITCH_X, y]);
  try {
    await waitFor(() => on(settings.get_value(key)), 5000, () => `the ${name} switch left ${schema} ${key} at ${settings.get_value(key).print(false)}`);
    require(on(settings.get_value(key)), `the ${name} switch sets ${schema} ${key}`);
    (await app.settle(() => true)).save(`${output}/settings-accessibility-${name}.png`);
  } finally {
    settings.reset(key);
    await sleep(LOADING);
  }
}

export async function checkSettingsAccessibility(context) {
  context.styles.interface.set_string('color-scheme', 'prefer-dark');
  const app = new LuftApp('settings', ['kestrel-settings:accessibility']);
  try {
    await app.open();
    await sleep(LOADING);
    await app.settle(() => true);
    for (const toggled of SWITCHES) await toggle(app, toggled, context);
  } finally {
    await app.close();
  }
}
