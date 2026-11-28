import Clutter from 'gi://Clutter';
import St from 'gi://St';

import {existing, labelOf, shown, styled} from '../lib/actors.js';
import {click, press, type} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {setWays} from '../lib/signIn.js';
import {eventually, events, lastSessionStart, promptState, require} from './lib/prompt.js';

const RECOVERY_KEY = 'abandon ability able about above absent absorb abstract absurd abuse access accident';

const rows = () => styled('kestrel-greeter-user', existing('kestrel-greeter-users')).filter((row): row is St.Button => row instanceof St.Button && row.mapped);
const theo = () => rows().find(row => row.accessible_name === 'Theo Brandt')!;
const mara = () => rows().find(row => row.accessible_name === 'Mara Lindqvist')!;
const offered = (text: string) => styled('kestrel-auth-quiet').find(button => shown(button) && labelOf(button) === text) ?? null;
const methods = () => events().filter(event => event.type === 'sign-in-method' && event.username === 'theo').map(event => event.method);
const failed = (user: string) => events().filter(event => event.type === 'authentication-failed' && event.username === user).length;

export async function checkSecurityKey() {
  await setWays('theo', ['security-key'], false);
  click(mara());
  click(theo());
  await eventually(() => methods().at(-1) === 'security-key' && promptState().hint === 'Security key PIN' && promptState().secret,
    'someone who signs in with a security key is asked for its PIN first');
  click(mara());
  await eventually(() => lastSessionStart() === 'mara' && promptState().hint === 'Password', 'someone else gets the password field');
  let passwordShown = false;
  const watching = global.stage.connect('after-paint', () => {
    passwordShown ||= lastSessionStart() === 'theo' && promptState().hint === 'Password';
  });
  click(theo());
  await eventually(() => lastSessionStart() === 'theo' && promptState().hint === 'Security key PIN', 'choosing them again opens on the key');
  global.stage.disconnect(watching);
  require(!passwordShown, 'the password field never shows before the key');
  require(!offered('Use password instead'), 'with the password turned off nothing offers it');
  await capture('login-security-key');
  const before = failed('theo');
  type('1111');
  press(Clutter.KEY_Return);
  await eventually(() => failed('theo') > before && promptState().hint === 'Security key PIN', 'a wrong PIN doesn’t sign in and asks again');
}

export async function checkRecoveryKey() {
  await setWays('theo', ['security-key'], false);
  click(mara());
  click(theo());
  await eventually(() => !!offered('Lost your key?'), 'someone without a password is offered the recovery key');
  click(offered('Lost your key?')!);
  await eventually(() => methods().at(-1) === 'recovery-key' && promptState().hint === 'Recovery key' && !promptState().secret,
    'losing the key asks for the recovery key, shown as it is typed');
  type(RECOVERY_KEY);
  press(Clutter.KEY_Return);
  await eventually(() => promptState().hint === 'Password' && promptState().secret, 'the recovery key brings the password back');
  await setWays('theo', [], true);
  click(mara());
  await eventually(() => lastSessionStart() === 'mara' && promptState().hint === 'Password', 'choosing someone else asks for their password');
}
