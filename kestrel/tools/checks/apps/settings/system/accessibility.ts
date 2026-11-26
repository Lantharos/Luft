import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type GLib from 'gi://GLib';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {checks} from '../../../lib/check.js';
import type {Query} from '../../../lib/apps/probe.js';
import {press} from '../../../lib/input/input.js';
import {changes} from '../../lib/apps.js';
import {show} from '../navigation.js';

const {require, eventually} = checks('Luft app');
interface Switch {
  name: string;
  control: Query;
  schema: string;
  key: string;
  on: (value: GLib.Variant) => boolean;
  expand?: boolean;
}

const SWITCHES: Switch[] = [
  {name: 'reduce-motion', control: {role: 'radio', name: 'Reduced'}, schema: 'org.gnome.desktop.a11y.interface', key: 'reduced-motion', on: value => value.get_string()[0] === 'reduce'},
  {name: 'high-contrast', control: {role: 'switch', name: 'High contrast'}, schema: 'org.gnome.desktop.a11y.interface', key: 'high-contrast', on: value => value.get_boolean()},
  {name: 'large-text', control: {role: 'switch', name: 'Large text'}, schema: 'org.gnome.desktop.interface', key: 'text-scaling-factor', on: value => value.get_double() > 1},
  {name: 'sticky-keys', control: {role: 'switch', name: 'Sticky keys'}, schema: 'org.gnome.desktop.a11y.keyboard', key: 'stickykeys-enable', on: value => value.get_boolean(), expand: true},
];

async function toggle(app: LuftApp, {name, control, schema, key, on, expand}: Switch) {
  const settings = new Gio.Settings({schema_id: schema});
  require(!on(settings.get_value(key)), `${name} starts off`);
  if (expand) await changes(app, 'Typing assist opens', async () => app.click(await app.find({role: 'button', name: 'Typing assist'})));
  const switched = await app.find(control);
  const off = await app.frame();
  app.click(switched);
  let turnedOn = off;
  try {
    await eventually(() => on(settings.get_value(key)), `the ${name} switch sets ${schema} ${key}`);
    await app.changes(off, `the ${name} switch turns on`);
    turnedOn = await app.settle(() => true);
    turnedOn.save(`settings-accessibility-${name}`);
  } finally {
    settings.reset(key);
  }
  await app.changes(turnedOn, `the ${name} switch turns off again`);
  if (expand) await changes(app, 'Escape closes Typing assist', () => press(Clutter.KEY_Escape));
}

export async function checkAccessibility(app: LuftApp) {
  await show(app, 'accessibility');
  for (const toggled of SWITCHES) await toggle(app, toggled);
}
