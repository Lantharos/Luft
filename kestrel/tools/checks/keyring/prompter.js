import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {descendants, firstStyled, labelled, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, press, type} from '../lib/input.js';
import {capture} from '../lib/screenshots.js';
import {KeyringClient, SecretPipe, focusedEntry, handle, keyringDialog, openedDialog} from './lib/client.js';

const {require, eventually} = checks('keyring');
const APP = 'com.lantharos.draft';
const GITHUB = {title: 'Allow Draft to use your password for github.com?', body: 'It’s saved in your Login keyring.', app: APP};
const UNLOCK = {title: 'Unlock your Login keyring', body: 'Draft wants to use a saved password.', app: APP};
const WRONG = 'That password didn’t work';
const DISMISSED = 2;

const openDialogs = () => styled('kestrel-keyring-dialog').filter(actor => actor.mapped);

async function checkCaller(client) {
  const denied = await client.access(handle(), GITHUB, Gio.DBus.session)
    .then(() => false, error => error.matches(Gio.DBusError, Gio.DBusError.ACCESS_DENIED));
  require(denied && !keyringDialog(), 'only the keyring can ask for prompts');
}

async function checkAccess(client) {
  const allowed = client.access(handle(), {...GITHUB, remember: true});
  const dialog = await openedDialog('an access prompt opens');
  require(firstStyled('kestrel-keyring-app-icon', dialog)?.mapped, 'access prompts show the app asking');
  await capture('keyring-access');
  click(labelled('Allow', dialog));
  const [response, results] = await allowed;
  require(response === 0 && results.remember === true, 'Allow answers with the remembered choice');
  await eventually(() => !keyringDialog(), 'an answered prompt closes');

  const escaped = client.access(handle(), GITHUB);
  await openedDialog('a second access prompt opens');
  press(Clutter.KEY_Escape);
  require((await escaped)[0] === 1, 'Escape denies access');
  await eventually(() => !keyringDialog(), 'a denied prompt closes');

  const id = handle();
  const closed = client.access(id, GITHUB);
  await openedDialog('a third access prompt opens');
  await client.close(id);
  require((await closed)[0] === DISMISSED, 'the keyring can take back a prompt');
  await eventually(() => !keyringDialog(), 'a taken back prompt closes');
}

async function checkFingerprint(client) {
  const id = handle();
  const touched = client.access(id, {...GITHUB, fingerprint: true});
  const dialog = await openedDialog('a fingerprint prompt opens');
  require(labelled('Touch the fingerprint reader to allow', dialog) && labelled('Don’t Allow', dialog) && !labelled('Allow', dialog),
    'fingerprint access waits for a touch and only offers to deny');
  await capture('keyring-fingerprint');
  await client.close(id);
  require((await touched)[0] === DISMISSED, 'the keyring closes a fingerprint prompt once the finger is checked');
  await eventually(() => !keyringDialog(), 'the fingerprint prompt closes');
}

async function checkPassword(client) {
  const id = handle();
  const pipe = new SecretPipe();
  const entered = client.password(id, UNLOCK, pipe);
  const dialog = await openedDialog('a password prompt opens');
  const entry = descendants(dialog).find(actor => actor instanceof St.PasswordEntry && actor.mapped);
  await focusedEntry(dialog);
  type('hunter2');
  press(Clutter.KEY_Return);
  require(await entered === 0, 'submitting a password answers the keyring');
  require(await pipe.read() === 'hunter2', 'the keyring receives exactly the typed password');
  require(keyringDialog() === dialog && entry.text === '' && !entry.reactive, 'the prompt waits while the keyring checks the password');

  const retryPipe = new SecretPipe();
  const retried = client.password(id, {...UNLOCK, warning: WRONG}, retryPipe);
  await eventually(() => entry.reactive && labelled(WRONG, dialog), 'a wrong password shows its warning');
  require(openDialogs().length === 1 && keyringDialog() === dialog, 'a wrong password reuses the open prompt');
  await capture('keyring-password-warning');
  await client.close(id);
  require(await retried === DISMISSED && await retryPipe.read() === '', 'closing a prompt hands back nothing');
  await eventually(() => !keyringDialog() && Main.modalCount === 0, 'the keyring closes the prompt once the password is right');
}

async function checkPin(client) {
  const id = handle();
  const pipe = new SecretPipe();
  const chosen = client.password(id, {title: 'Choose a PIN for your Login keyring', label: 'PIN', numeric: true, confirm: true, continue: 'Set PIN'}, pipe);
  const dialog = await openedDialog('a PIN prompt opens');
  await focusedEntry(dialog);
  type('1234');
  press(Clutter.KEY_Return);
  type('1235');
  press(Clutter.KEY_Return);
  await eventually(() => labelled('The entries don’t match', dialog), 'mismatched PINs keep the prompt open with a warning');
  type('1234');
  press(Clutter.KEY_Return);
  require(await chosen === 0 && await pipe.read() === '1234', 'matching PINs are handed to the keyring');
  await client.close(id);
  await eventually(() => !keyringDialog(), 'the PIN prompt closes');
}

async function checkLocked(client) {
  Main.screenShield.lock(false);
  try {
    const waiting = client.access(handle(), GITHUB);
    await client.close(handle());
    require(!keyringDialog(), 'prompts wait while the screen is locked');
    Main.screenShield.deactivate(false);
    await eventually(() => keyringDialog(), 'a waiting prompt appears after unlocking');
    Main.screenShield.lock(false);
    require((await waiting)[0] === DISMISSED, 'locking the screen dismisses an open prompt');
  } finally {
    Main.screenShield.deactivate(false);
  }
  await eventually(() => !keyringDialog() && !Main.screenShield.locked, 'the session unlocks without the dismissed prompt');
}

export async function run() {
  const client = new KeyringClient();
  try {
    require(await client.ownSecretService(), 'the checks stand in for the keyring');
    await checkCaller(client);
    await checkAccess(client);
    await checkFingerprint(client);
    await checkPassword(client);
    await checkPin(client);
    await checkLocked(client);
  } finally {
    client.destroy();
  }
}
