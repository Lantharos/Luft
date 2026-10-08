import Gio from 'gi://Gio';

import {checks} from '../../lib/check.js';
import {changes} from '../lib/apps.js';
import {show} from './navigation.js';

const {require, eventually} = checks('Luft app');
const SWITCH_X = 959;
const TYPING_ASSIST = [SWITCH_X, 582];
const SWITCHES = [
  {name: 'reduce-animations', y: 349, schema: 'org.gnome.desktop.interface', key: 'enable-animations', on: value => !value.get_boolean()},
  {name: 'high-contrast', y: 293, schema: 'org.gnome.desktop.a11y.interface', key: 'high-contrast', on: value => value.get_boolean()},
  {name: 'large-text', y: 237, schema: 'org.gnome.desktop.interface', key: 'text-scaling-factor', on: value => value.get_double() > 1},
  {name: 'sticky-keys', y: 638, schema: 'org.gnome.desktop.a11y.keyboard', key: 'stickykeys-enable', on: value => value.get_boolean(), expand: true},
];

async function toggle(app, {name, y, schema, key, on, expand}) {
  const settings = new Gio.Settings({schema_id: schema});
  require(!on(settings.get_value(key)), `${name} starts off`);
  if (expand) await changes(app, 'Typing assist opens', () => app.click(TYPING_ASSIST));
  const off = await app.frame();
  app.click([SWITCH_X, y]);
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
}

export async function checkAccessibility(app) {
  await show(app, 'accessibility');
  for (const toggled of SWITCHES) await toggle(app, toggled);
}
