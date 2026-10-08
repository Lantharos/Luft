import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {ScratchKeyring} from '../../fixtures/services/secretService.js';
import {descendants, firstStyled, labelled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, press, type} from '../lib/input.js';
import {repository, scratch, spawn} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {focusedEntry, keyringDialog, openedDialog} from './lib/client.js';

const {require, eventually} = checks('pinentry');
const PINENTRY = repository('kestrel/keyring/target/release/luft-pinentry');
const PASSPHRASE = 'correct horse 7';
const USER_ID = 'Kestrel Check <check@lantharos.com>';
const BAD_PASSPHRASE_TIMEOUT = 5000;

class GnuPG {
  constructor() {
    this.home = scratch('pinentry-gnupg');
    GLib.mkdir_with_parents(this.home, 0o700);
    GLib.file_set_contents(`${this.home}/gpg-agent.conf`, `pinentry-program ${PINENTRY}\n`);
  }

  run(argv, input = '') {
    const process = spawn(argv, {
      env: {GNUPGHOME: this.home, GPG_TTY: null},
      flags: Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_MERGE,
    });
    return new Promise(resolve => process.communicate_utf8_async(input, null, (source, result) => {
      const [, output] = source.communicate_utf8_finish(result);
      resolve({ok: source.get_successful(), output: output ?? ''});
    }));
  }

  gpg(...args) {
    return this.run(['gpg', '--batch', ...args]);
  }

  sign() {
    return this.run(['gpg', '--batch', '--clearsign'], 'Kestrel signs this.\n');
  }

  forget() {
    return this.run(['gpg-connect-agent', 'reloadagent', '/bye']);
  }

  ask(command) {
    return this.run(['gpg-connect-agent', command, '/bye']);
  }

  async destroy() {
    await this.run(['gpgconf', '--kill', 'gpg-agent']);
    await this.run(['rm', '-rf', this.home]);
  }
}

const promptClosed = () => eventually(() => !keyringDialog(), 'the pinentry prompt closes');

async function checkNewPassphrase(gnupg) {
  const generated = gnupg.gpg('--quick-gen-key', USER_ID, 'ed25519', 'sign', 'never');
  const dialog = await openedDialog('a new key asks for its passphrase');
  const confirm = descendants(dialog).filter(actor => actor instanceof St.PasswordEntry)[1];
  require(labelled('Choose a passphrase', dialog) && confirm?.mapped && !labelled('Save in your keyring', dialog),
    'a new key asks for its passphrase twice in Kestrel');
  await focusedEntry(dialog);
  type(PASSPHRASE);
  press(Clutter.KEY_Return);
  type('correct horse');
  press(Clutter.KEY_Return);
  await eventually(() => labelled('Does not match - try again', dialog), 'GnuPG’s own words explain a mismatch');
  await capture('pinentry-new-passphrase');
  type(PASSPHRASE);
  press(Clutter.KEY_Return);
  const {ok} = await generated;
  require(ok, 'the key is made with the passphrase typed in Kestrel');
  await promptClosed();
}

async function checkSigning(gnupg, keyring) {
  await gnupg.forget();
  const signed = gnupg.sign();
  const dialog = await openedDialog('signing asks for the passphrase');
  require(labelled('Enter your passphrase', dialog) && labelled('Save in your keyring', dialog),
    'signing asks to unlock the key and offers to save the passphrase');
  await focusedEntry(dialog);
  type('wrong horse');
  press(Clutter.KEY_Return);
  await eventually(() => descendants(dialog).some(actor => actor.text?.startsWith('Bad Passphrase')),
    'a wrong passphrase asks again', BAD_PASSPHRASE_TIMEOUT);
  require(keyringDialog() === dialog, 'a wrong passphrase asks again in the same prompt');
  await capture('pinentry-unlock');
  click(labelled('Save in your keyring', dialog));
  await focusedEntry(dialog);
  type(PASSPHRASE);
  press(Clutter.KEY_Return);
  const {ok, output} = await signed;
  require(ok && output.includes('BEGIN PGP SIGNATURE'), 'the right passphrase signs');
  require(keyring.items.length === 1 && keyring.items[0].attributes['xdg:schema'] === 'org.gnupg.Passphrase',
    'the passphrase is saved in the keyring the way GnuPG’s pinentry saves it');
  await promptClosed();

  await gnupg.forget();
  const remembered = await gnupg.sign();
  require(remembered.ok && !keyringDialog(), 'a saved passphrase signs without asking');
}

async function checkQuality(gnupg) {
  const asked = gnupg.ask('GET_PASSPHRASE --qualitybar --repeat=0 kestrel-check X Passphrase Choose%20a%20passphrase%20for%20the%20backup');
  const dialog = await openedDialog('a passphrase with a quality bar is asked');
  const fill = firstStyled('kestrel-quality-fill', dialog);
  require(fill?.mapped && fill.width === 0, 'a passphrase with a quality bar starts empty');
  await focusedEntry(dialog);
  type(PASSPHRASE);
  await eventually(() => fill.width === fill.get_parent().get_allocation_box().get_width(),
    'GnuPG rates the passphrase while it’s typed and a strong one fills the bar');
  await capture('pinentry-quality');
  press(Clutter.KEY_Return);
  const {output} = await asked;
  require(output.startsWith('OK '), 'the rated passphrase is handed to GnuPG');
  await promptClosed();
}

async function checkConfirm(gnupg) {
  const asked = gnupg.ask('GET_CONFIRMATION Forget%20the%20saved%20passphrase%3F');
  const dialog = await openedDialog('a confirmation is asked');
  require(labelled('Forget the saved passphrase?', dialog) && labelled('OK', dialog) && labelled('Cancel', dialog),
    'confirmations ask in Kestrel');
  await capture('pinentry-confirm');
  press(Clutter.KEY_Escape);
  const {output} = await asked;
  require(output.includes('ERR') && output.toLowerCase().includes('cancel'), 'Escape answers a confirmation with Cancel');
  await promptClosed();
}

export async function run() {
  require(GLib.file_test(PINENTRY, GLib.FileTest.IS_EXECUTABLE), 'Kestrel’s pinentry is built');
  const keyring = new ScratchKeyring();
  const gnupg = new GnuPG();
  try {
    require(await keyring.own(), 'the checks stand in for the keyring');
    await checkNewPassphrase(gnupg);
    await checkSigning(gnupg, keyring);
    await checkQuality(gnupg);
    await checkConfirm(gnupg);
  } finally {
    await gnupg.destroy();
    keyring.close();
  }
}
