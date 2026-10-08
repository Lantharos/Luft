import Clutter from 'gi://Clutter';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {descendants, named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, press, rest} from '../lib/input.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('surface');

async function checkSwitching() {
  toggleSurface('notifications');
  const notifications = named('kestrel-notifications');
  await eventually(() => shown(notifications), 'the notification center opens');
  toggleSurface('quick');
  const quick = named('kestrel-quick-settings');
  const siblings = quick.get_parent().get_children();
  require(siblings.indexOf(quick) > siblings.indexOf(notifications), 'the opening surface slides in above the closing one');
  await eventually(() => shown(quick) && !notifications.visible, 'Quick Settings replaces the notification center');
  await capture('quick-settings');
  return quick;
}

async function checkDoNotDisturb(quick) {
  const quiet = descendants(quick).find(actor => actor.title === 'Do Not Disturb');
  require(quiet?.mapped, 'Quick Settings offers Do Not Disturb');
  const initial = quiet.checked;
  click(quiet);
  await eventually(() => quiet.checked !== initial, 'clicking Do Not Disturb turns it over');
  click(quiet);
  await eventually(() => quiet.checked === initial, 'clicking it again restores it');
  rest();
}

async function checkSelectors(quick) {
  const controls = descendants(quick).filter(actor => actor.menu && actor.menuEnabled && actor.visible);
  require(controls.length > 0, 'Quick Settings has controls with choices');
  for (const [index, control] of controls.entries()) {
    const name = control.title ?? control.slider?.accessible_name;
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
  await capture('notification-center');

  toggleSurface('start');
  const start = named('kestrel-start');
  await eventually(() => shown(start), 'Start opens from the notification center');
  await settled();
  click(start.get_last_child().get_last_child());
  const sessionActions = () => named('Power off', start)?.get_parent();
  await eventually(() => sessionActions()?.visible, 'the power button shows the session actions');
  await capture('power-menu');
  press(Clutter.KEY_Escape);
  await eventually(() => start.visible && !sessionActions().visible, 'Escape closes the session actions and keeps Start open');
}

export async function run() {
  const quick = await checkSwitching();
  await checkDoNotDisturb(quick);
  await checkSelectors(quick);
  await checkPowerMenu();
}
