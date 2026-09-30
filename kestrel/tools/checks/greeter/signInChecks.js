import Clutter from 'gi://Clutter';

import {promptState} from './prompt.js';

export async function checkSigningIn(tools) {
  const {pause, capture, find, visible, require, press, type, output} = tools;
  await type('tulips');
  await press(Clutter.KEY_Return, 700);
  require(promptState(tools).hint === 'Verification code' && visible(find('Back')), 'a second step asks for its code with a way back');
  await capture(`${output}/login-second-factor.png`);
  await type('424242');
  await press(Clutter.KEY_Return, 0);
  await pause(5000);
  throw new Error('Kestrel login screen check failed: signing in did not close the login screen');
}
