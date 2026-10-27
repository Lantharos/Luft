import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';
import {getStyleVariant, battery} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {named, ofType, showsText, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {press} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {settled, waitUntil} from '../lib/wait.js';
import {lockAndWake, showPrompt, unlock} from './lib/shield.js';

const {require, eventually} = checks('lock screen');
const ACCESSIBILITY = ['Screen reader', 'Zoom', 'On-screen keyboard', 'High contrast', 'Dwell click', 'Larger text'];
const LIGHT_INK = 200;

const openMenu = () => styled('kestrel-context-menu').find(actor => actor.mapped && actor.opacity === 255) ?? null;

function inksLight(actor: St.Widget) {
  const {red, green, blue} = actor.get_theme_node().get_foreground_color();
  return [red, green, blue].every(channel => channel > LIGHT_INK);
}

async function open(button: string, label: string) {
  ofType(named(button), St.Button).emit('clicked', 1);
  await eventually(openMenu, label);
  await settled();
  return waitUntil(openMenu, label);
}

async function close() {
  press(Clutter.KEY_Escape);
  await eventually(() => !styled('kestrel-context-menu').some(actor => actor.visible), 'Escape closes the menu');
}

async function checkAccessibility() {
  await open('kestrel-lock-accessibility', 'accessibility opens its menu');
  require(ACCESSIBILITY.every(text => showsText(text)),
    'accessibility offers the screen reader, zoom, on-screen keyboard, high contrast, dwell click and larger text');
  await capture('lock-accessibility-dark');
  await close();
}

async function switchStyle(styles: Gio.Settings, scheme: string) {
  styles.set_string('color-scheme', scheme);
  const variant = scheme === 'prefer-dark' ? 'dark' : 'light';
  await eventually(() => getStyleVariant() === variant, `the shell turns ${variant}`);
  await settled();
}

async function checkPower(styles: Gio.Settings, scheme: string) {
  const menu = await open('kestrel-lock-power', 'power opens its menu');
  require(showsText('Suspend'), 'power offers suspend while locked');
  await switchStyle(styles, 'prefer-dark');
  await capture('lock-power-dark');
  await switchStyle(styles, 'prefer-light');
  require(inksLight(menu), 'the power menu stays dark while the desktop is light');
  await capture('lock-power-light');
  await switchStyle(styles, scheme);
  await close();
  require(!showsText('Suspend'), 'menus close again on the lock screen');
}

export async function run() {
  const styles = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const scheme = styles.get_string('color-scheme');
  battery.pin({percentage: 64, status: 'charging', secondsLeft: 0});
  await lockAndWake();
  try {
    await showPrompt();
    require(named('kestrel-lock-controls') && named('kestrel-lock-accessibility') && named('kestrel-lock-power'),
      'the unlock prompt shows accessibility and power at the bottom right');
    await eventually(() => {
      const indicator = named('kestrel-lock-battery');
      return indicator?.mapped && named('Battery 64%, charging', indicator);
    }, 'the unlock prompt shows the charging battery');
    await checkAccessibility();
    await checkPower(styles, scheme);
  } finally {
    styles.set_string('color-scheme', scheme);
    await unlock();
    battery.pin(undefined);
  }
}
