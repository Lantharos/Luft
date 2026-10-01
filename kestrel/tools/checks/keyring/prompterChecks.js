import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {checker, clicker, descendants, labelled} from '../portal/backend.js';
import {KeyringClient, SecretPipe, handle, keyringDialog, keyringDialogs} from './client.js';

const require = checker('keyring');
const APP = 'com.lantharos.draft';
const GITHUB = {title: 'Allow Draft to use your password for github.com?', body: 'It’s saved in your Login keyring.', app: APP};
const UNLOCK = {title: 'Unlock your Login keyring', body: 'Draft wants to use a saved password.', app: APP};
const WRONG = 'That password didn’t work';

async function checkCaller({client}) {
  const denied = await client.access(handle(), GITHUB, Gio.DBus.session)
    .then(() => false, error => error.matches(Gio.DBusError, Gio.DBusError.ACCESS_DENIED));
  require(denied && !keyringDialog(), 'only the keyring can ask for prompts');
}

async function checkAccess({client, pause, capture, output, click, press}) {
  const allowed = client.access(handle(), {...GITHUB, remember: true});
  await pause(500);
  const dialog = keyringDialog();
  require(dialog && descendants(dialog).some(actor => actor.has_style_class_name?.('kestrel-keyring-app-icon')), 'access prompts show the app asking');
  await capture(`${output}/keyring-access.png`);
  await click(labelled(dialog, 'Allow'));
  const [response, results] = await allowed;
  require(response === 0 && results.remember === true, 'Allow answers with the remembered choice');
  await pause(300);

  const escaped = client.access(handle(), GITHUB);
  await pause(400);
  press(Clutter.KEY_Escape);
  require((await escaped)[0] === 1, 'Escape denies access');
  await pause(300);

  const id = handle();
  const closed = client.access(id, GITHUB);
  await pause(400);
  await client.close(id);
  require((await closed)[0] === 2, 'the keyring can take back a prompt');
  await pause(300);
  require(!keyringDialog(), 'a taken back prompt closes');
}

async function checkFingerprint({client, pause, capture, output}) {
  const id = handle();
  const touched = client.access(id, {...GITHUB, fingerprint: true});
  await pause(500);
  const dialog = keyringDialog();
  require(labelled(dialog, 'Touch the fingerprint reader to allow') && labelled(dialog, 'Don’t Allow') && !labelled(dialog, 'Allow'),
    'fingerprint access waits for a touch and only offers to deny');
  await capture(`${output}/keyring-fingerprint.png`);
  await client.close(id);
  require((await touched)[0] === 2, 'the keyring closes a fingerprint prompt once the finger is checked');
  await pause(300);
}

async function checkPassword({client, pause, capture, output, type, press}) {
  const id = handle();
  const pipe = new SecretPipe();
  const entered = client.password(id, UNLOCK, pipe);
  await pause(500);
  const dialog = keyringDialog();
  const entry = descendants(dialog).find(actor => actor instanceof St.PasswordEntry && actor.mapped);
  type('hunter2');
  press(Clutter.KEY_Return);
  require(await entered === 0, 'submitting a password answers the keyring');
  require(await pipe.read(pause) === 'hunter2', 'the keyring receives exactly the typed password');
  require(keyringDialog() === dialog && entry.text === '' && !entry.reactive, 'the prompt waits while the keyring checks the password');

  const retryPipe = new SecretPipe();
  const retried = client.password(id, {...UNLOCK, warning: WRONG}, retryPipe);
  await pause(700);
  require(keyringDialogs().length === 1 && keyringDialog() === dialog && entry.reactive && labelled(dialog, WRONG),
    'a wrong password reuses the open prompt with its warning');
  await capture(`${output}/keyring-password-warning.png`);
  await client.close(id);
  require(await retried === 2 && await retryPipe.read(pause) === '', 'closing a prompt hands back nothing');
  await pause(400);
  require(!keyringDialog() && Main.modalCount === 0, 'the keyring closes the prompt once the password is right');
}

async function checkPin({client, pause, type, press}) {
  const id = handle();
  const pipe = new SecretPipe();
  const chosen = client.password(id, {title: 'Choose a PIN for your Login keyring', label: 'PIN', numeric: true, confirm: true, continue: 'Set PIN'}, pipe);
  await pause(500);
  type('1234');
  press(Clutter.KEY_Return);
  type('1235');
  press(Clutter.KEY_Return);
  await pause(300);
  require(keyringDialog() && labelled(keyringDialog(), 'The entries don’t match'), 'mismatched PINs keep the prompt open with a warning');
  type('1234');
  press(Clutter.KEY_Return);
  require(await chosen === 0 && await pipe.read(pause) === '1234', 'matching PINs are handed to the keyring');
  await client.close(id);
  await pause(400);
}

async function checkLocked({client, pause}) {
  Main.screenShield.lock(false);
  await pause(600);
  const waiting = client.access(handle(), GITHUB);
  await pause(400);
  require(!keyringDialog(), 'prompts wait while the screen is locked');
  Main.screenShield.deactivate(false);
  await pause(800);
  require(!!keyringDialog(), 'a waiting prompt appears after unlocking');
  Main.screenShield.lock(false);
  require((await waiting)[0] === 2, 'locking the screen dismisses an open prompt');
  await pause(600);
  Main.screenShield.deactivate(false);
  await pause(600);
  require(!keyringDialog() && !Main.screenShield.locked, 'the session unlocks without the dismissed prompt');
}

export async function checkKeyring({pause, capture, output, pointer, keyboard}) {
  const press = symbol => {
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.RELEASED);
  };
  const type = text => [...text].forEach(character => press(character.charCodeAt(0)));
  const client = new KeyringClient();
  try {
    require(await client.ownSecretService(), 'the checks stand in for the keyring');
    const context = {client, pause, capture, output, press, type, click: clicker(pointer, pause)};
    await checkCaller(context);
    await checkAccess(context);
    await checkFingerprint(context);
    await checkPassword(context);
    await checkPin(context);
    await checkLocked(context);
  } finally {
    client.destroy();
  }
}
