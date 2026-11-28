import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';

import {existing, shown, styled} from '../lib/actors.js';
import {click, press} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {eventually, lastSessionStart, require} from './lib/prompt.js';

const CROSSFADE = 1000;

const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const avatarRounded = () => styled('kestrel-auth-avatar-well').some(well => well.mapped && well.get_theme_node().get_border_radius(St.Corner.TOPLEFT) > 0);
const rounded = () => kestrel.get_boolean('rounded-window-corners') && avatarRounded();
const square = () => !kestrel.get_boolean('rounded-window-corners') && !avatarRounded();
const fluted = () => kestrel.get_boolean('lock-screen-fluted');

async function look(name: string) {
  await settled(2 * CROSSFADE);
  await capture(name);
}

export async function checkCorners() {
  const rows = styled('kestrel-greeter-user', existing('kestrel-greeter-users')).filter((row): row is St.Button => row instanceof St.Button && row.mapped);
  require(rows[1].checked && rounded() && !fluted(), 'someone with rounded corners and frosted glass sees them on the login screen');

  click(rows[0]);
  await eventually(() => lastSessionStart() === 'ines' && square() && fluted(), 'choosing someone with square corners and fluted glass shows both on the login screen');
  await look('login-corners-square');
  const menu = existing('kestrel-context-menu');
  click(existing('kestrel-greeter-power'));
  await eventually(() => shown(menu) && styled('kestrel-square-surface', menu).length > 0, 'menus on the login screen are square too');
  press(Clutter.KEY_Escape);
  await eventually(() => !shown(menu), 'Escape closes it');

  click(rows[2]);
  await eventually(() => lastSessionStart() === 'theo' && rounded() && !fluted(), 'someone who never chose gets rounded corners and frosted glass back');
  click(rows[1]);
  await eventually(() => lastSessionStart() === 'mara' && rounded(), 'choosing someone else keeps their rounded corners');
}
