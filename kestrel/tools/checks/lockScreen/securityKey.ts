import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {labelOf, shown, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, press, type} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {setWays} from '../lib/signIn.js';
import {lockAndWake, promptEntry, showPrompt, unlock} from './lib/shield.js';

const {require, eventually} = checks('security keys and cards');
const PASSWORD = 'correct horse';
const remembered = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'sign-in-method']));
const rememberedMethod = () => new TextDecoder().decode(remembered.load_contents(null)[1]);
const offered = (text: string) => styled('kestrel-auth-quiet').find(button => shown(button) && labelOf(button) === text) ?? null;

async function unlockWithKey() {
  await setWays(GLib.get_user_name(), ['security-key'], false);
  await lockAndWake();
  await showPrompt();
  await eventually(() => promptEntry()?.hint_text === 'Security key PIN', 'the prompt opens on the security key’s PIN');
  require(!offered('Use password instead'), 'with the password turned off nothing offers it');
  await capture('unlock-security-key');
  type('2468');
  press(Clutter.KEY_Return);
  await eventually(() => !Main.screenShield.locked, 'the PIN and a touch unlock');
  require(rememberedMethod() === 'security-key', 'the key is remembered as the way to unlock');
}

async function cardOrPassword() {
  await setWays(GLib.get_user_name(), ['smart-card'], true);
  await lockAndWake();
  await showPrompt();
  await eventually(() => promptEntry()?.hint_text === 'Smart card PIN', 'with a card enrolled the prompt asks for it first');
  click(offered('Use password instead')!);
  await eventually(() => promptEntry()?.hint_text === 'Password', 'the password is a click away');
  type(PASSWORD);
  press(Clutter.KEY_Return);
  await eventually(() => !Main.screenShield.locked, 'the password unlocks');
  await lockAndWake();
  await showPrompt();
  await eventually(() => promptEntry()?.hint_text === 'Smart card PIN', 'the card still comes before the password next time');
}

export async function run() {
  try {
    await unlockWithKey();
    await cardOrPassword();
  } finally {
    await setWays(GLib.get_user_name(), [], true);
    if (Main.screenShield.locked) await unlock();
  }
}
