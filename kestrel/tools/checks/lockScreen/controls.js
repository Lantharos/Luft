import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';

import {named, showsText, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {press} from '../lib/input.js';
import {capture, captureFrame} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {lockAndWake, showPrompt, unlock} from './lib/shield.js';

const {require, eventually} = checks('lock screen');
const ACCESSIBILITY = ['Screen reader', 'Zoom', 'On-screen keyboard', 'High contrast', 'Dwell click', 'Larger text'];
const THEME_TOLERANCE = 2;

const openMenu = () => styled('kestrel-context-menu').find(actor => actor.mapped && actor.opacity === 255) ?? null;

function areaOf(actor) {
  const [x, y] = actor.get_transformed_position().map(Math.round);
  return {x, y, width: Math.round(actor.width), height: Math.round(actor.height)};
}

async function open(button, label) {
  named(button).emit('clicked', 1);
  await eventually(openMenu, label);
  await settled();
  return openMenu();
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

async function switchStyle(styles, scheme, menu, label) {
  const before = await captureFrame(areaOf(menu));
  styles.set_string('color-scheme', scheme);
  await eventually(async () => !(await captureFrame(areaOf(menu))).looksLike(before, THEME_TOLERANCE), label);
  await settled();
}

async function checkPower(styles, scheme) {
  const menu = await open('kestrel-lock-power', 'power opens its menu');
  require(showsText('Suspend'), 'power offers suspend while locked');
  await capture('lock-power-dark');
  await switchStyle(styles, 'prefer-light', menu, 'the power menu follows the light style');
  await capture('lock-power-light');
  await switchStyle(styles, scheme, menu, 'the power menu returns to the dark style');
  await close();
  require(!showsText('Suspend'), 'menus close again on the lock screen');
}

export async function run() {
  const styles = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const scheme = styles.get_string('color-scheme');
  await lockAndWake();
  try {
    await showPrompt();
    require(named('kestrel-lock-controls') && named('kestrel-lock-accessibility') && named('kestrel-lock-power'),
      'the unlock prompt shows accessibility and power at the bottom right');
    await checkAccessibility();
    await checkPower(styles, scheme);
  } finally {
    styles.set_string('color-scheme', scheme);
    await unlock();
  }
}
