import type Clutter from 'gi://Clutter';
import {QuickMenuToggle, toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, rest} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {control} from './lib/networkManager.js';

const {require, eventually} = checks('phone tethering');

const toggles = (quick: Clutter.Actor) =>
  descendants(quick).filter((actor): actor is QuickMenuToggle => actor instanceof QuickMenuToggle && actor.visible);

async function checkQuickSettings() {
  toggleSurface('quick');
  const quick = named('kestrel-quick-settings')!;
  await eventually(() => shown(quick), 'Quick Settings opens');
  const phone = await eventually(() => toggles(quick).find(toggle => toggle.title === 'iPhone'), 'a tethered iPhone gets a toggle of its own');
  const wired = require(toggles(quick).find(toggle => toggle.title === 'Wired'), 'the cable keeps its own Wired toggle');
  require(!wired.subtitle, 'the Wired toggle no longer counts the phone as a second cable');
  require(phone.checked && wired.checked, 'both connections show as on');
  await settled();
  await capture('quick-settings-phone');

  click(phone);
  await eventually(() => !phone.checked, 'clicking the phone turns its connection off');
  require(wired.checked, 'turning the phone off leaves the cable connected');
  click(phone);
  await eventually(() => phone.checked, 'clicking it again connects the phone');
  rest();
  toggleSurface('quick');
  await eventually(() => !quick.visible, 'Quick Settings closes');
}

export async function run() {
  await control('AddPhone');
  try {
    await checkQuickSettings();
  } finally {
    await control('RemovePhone');
  }
}
