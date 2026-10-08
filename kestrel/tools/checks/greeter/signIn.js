import Clutter from 'gi://Clutter';

import {named, shown} from '../lib/actors.js';
import {press, type} from '../lib/input.js';
import {capture} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {eventually, promptState} from './prompt.js';

const CLOSE_TIMEOUT = 5000;

export async function checkSigningIn() {
  await eventually(() => promptState().entry?.clutter_text.has_key_focus(), 'the password field takes the keyboard again');
  type('tulips');
  await eventually(() => promptState().entry?.text === 'tulips', 'the password is typed');
  press(Clutter.KEY_Return);
  await eventually(() => promptState().hint === 'Verification code' && shown(named('Back')), 'a second step asks for its code with a way back');
  await capture('login-second-factor');
  type('424242');
  await eventually(() => promptState().entry?.text === '424242', 'the code is typed');
  press(Clutter.KEY_Return);
  await pause(CLOSE_TIMEOUT);
  throw new Error('Kestrel login screen check failed: signing in did not close the login screen');
}
