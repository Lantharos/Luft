import Clutter from 'gi://Clutter';
import St from 'gi://St';
import {getStyleVariant} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {existing, labelled, named, shown, shownStyled, styled, textOf} from '../lib/actors.js';
import {click, press, type} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {waitUntil} from '../lib/wait.js';
import {enroll, scan} from '../lockScreen/lib/fingerprint.js';
import {eventually, events, promptState} from './lib/prompt.js';

const SCANNING = 'Touch the fingerprint reader';

const hint = () => {
  const label = shownStyled('kestrel-auth-hint');
  return label && textOf(label);
};
const fingerprintFirst = () => shown(labelled('Use password instead')) && !promptState().entry;
const chosen = (method: string) => events().filter(event => event.type === 'sign-in-method' && event.username === 'ines').at(-1)?.method === method;

export async function checkFingerprint() {
  await enroll('ines', ['right-index-finger']);
  const rows = styled('kestrel-greeter-user', existing('kestrel-greeter-users')).filter((row): row is St.Button => row instanceof St.Button && row.mapped);
  click(rows[0]);
  await eventually(() => chosen('fingerprint') && fingerprintFirst() && hint() === SCANNING,
    'a person with a fingerprint is asked for it first, without a password field');
  await eventually(() => getStyleVariant() === 'light', 'the login screen takes the light style of the person shown');
  await capture('login-fingerprint-light');
  await waitUntil(() => scan('verify-finger-not-centered'), 'the reader listens');
  await eventually(() => hint() === 'Center your finger and try again', 'the reader asking for a centered finger says so');
  type('h');
  await eventually(() => chosen('password') && promptState().secret && promptState().entry?.text === 'h',
    'typing switches to the password and keeps the first key');
  press(Clutter.KEY_BackSpace);
  click(rows[1]);
  await eventually(() => getStyleVariant() === 'dark' && named('kestrel-auth-name') && textOf(named('kestrel-auth-name')) === 'Mara Lindqvist',
    'choosing someone else brings back their dark style');
}
