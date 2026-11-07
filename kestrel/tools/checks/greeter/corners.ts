import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';

import {existing, shown, styled} from '../lib/actors.js';
import {click, press} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {eventually, lastSessionStart, require} from './lib/prompt.js';

const CROSSFADE = 1000;

const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const avatarRounded = () => styled('kestrel-auth-avatar-well').some(well => well.mapped && well.get_theme_node().get_border_radius(St.Corner.TOPLEFT) > 0);
const rounded = () => kestrel.get_boolean('rounded-window-corners') && avatarRounded();
const square = () => !kestrel.get_boolean('rounded-window-corners') && !avatarRounded();

async function look(name: string) {
  await pause(CROSSFADE);
  await settled();
  await capture(name);
}

export async function checkCorners() {
  const rows = styled('kestrel-greeter-user', existing('kestrel-greeter-users')).filter((row): row is St.Button => row instanceof St.Button && row.mapped);
  require(rows[1].checked && rounded(), 'someone with rounded corners sees them on the login screen');
  await look('login-corners-rounded');

  click(rows[0]);
  await eventually(() => lastSessionStart() === 'ines' && square(), 'choosing someone with square corners squares the login screen');
  await look('login-corners-square');
  const menu = existing('kestrel-context-menu');
  click(existing('kestrel-greeter-power'));
  await eventually(() => shown(menu) && styled('kestrel-square-surface', menu).length > 0, 'menus on the login screen are square too');
  await look('login-corners-square-menu');
  press(Clutter.KEY_Escape);
  await eventually(() => !shown(menu), 'Escape closes it');

  click(rows[2]);
  await eventually(() => lastSessionStart() === 'theo' && rounded(), 'someone who never chose gets rounded corners back');
  click(rows[1]);
  await eventually(() => lastSessionStart() === 'mara' && rounded(), 'choosing someone else keeps their rounded corners');
}
