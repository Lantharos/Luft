import Clutter from 'gi://Clutter';
import {QuickMenuToggle, QuickSlider, QuickToggle, toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, press, rest} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {besideItsButton} from '../lib/edge.js';

const {require, eventually} = checks('surface');

async function checkSwitching() {
  toggleSurface('notifications');
  const notifications = named('kestrel-notifications')!;
  await eventually(() => shown(notifications), 'the notification center opens');
  toggleSurface('quick');
  const quick = named('kestrel-quick-settings')!;
  const siblings = quick.get_parent()!.get_children();
  require(siblings.indexOf(quick) > siblings.indexOf(notifications), 'the opening surface slides in above the closing one');
  await eventually(() => shown(quick) && !notifications.visible, 'Quick Settings replaces the notification center');
  await settled();
  require(besideItsButton(quick, named('Quick settings', named('kestrel-panel')!)!), 'Quick Settings opens beside its button');
  await capture('quick-settings');
  return quick;
}

async function checkDoNotDisturb(quick: Clutter.Actor) {
  const found = descendants(quick).filter((actor): actor is QuickToggle => actor instanceof QuickToggle).find(toggle => toggle.title === 'Do Not Disturb');
  const quiet = require(found?.mapped && found, 'Quick Settings offers Do Not Disturb');
  const initial = quiet.checked;
  click(quiet);
  await eventually(() => quiet.checked !== initial, 'clicking Do Not Disturb turns it over');
  click(quiet);
  await eventually(() => quiet.checked === initial, 'clicking it again restores it');
  rest();
}

async function checkSelectors(quick: Clutter.Actor) {
  const controls = descendants(quick).filter((actor): actor is QuickMenuToggle | QuickSlider => actor instanceof QuickMenuToggle || actor instanceof QuickSlider)
    .filter(control => control.menu && control.menuEnabled && control.visible);
  require(controls.length > 0, 'Quick Settings has controls with choices');
  for (const [index, control] of controls.entries()) {
    const name = 'slider' in control ? control.slider.accessible_name : control.title;
    control.menu.open();
    await eventually(() => control.menu.isOpen, `the ${name} choices open`);
    await capture(`quick-selector-${index + 1}`);
    control.menu.close({animate: false});
    await eventually(() => !control.menu.isOpen, `the ${name} choices close`);
  }
}

async function checkPowerMenu() {
  toggleSurface('notifications');
  await eventually(() => shown(named('kestrel-notifications')), 'the notification center opens from Quick Settings');
  await settled();
  require(besideItsButton(named('kestrel-notifications')!, named('Notifications and date', named('kestrel-panel')!)!), 'the notification center opens beside the clock');
  await capture('notification-center');

  toggleSurface('start');
  const start = named('kestrel-start')!;
  await eventually(() => shown(start), 'Start opens from the notification center');
  await settled();
  require(besideItsButton(start, named('Start', named('kestrel-panel')!)!), 'Start opens beside its button');
  const footer = start.get_last_child()!;
  click(footer.get_last_child()!);
  const sessionActions = () => named('Power off', footer)?.get_parent();
  await eventually(() => sessionActions()?.visible, 'the power button shows the session actions');
  await capture('power-menu');
  press(Clutter.KEY_Escape);
  await eventually(() => start.visible && !sessionActions()!.visible, 'Escape closes the session actions and keeps Start open');
}

export async function run() {
  const quick = await checkSwitching();
  await checkDoNotDisturb(quick);
  await checkSelectors(quick);
  await checkPowerMenu();
}
