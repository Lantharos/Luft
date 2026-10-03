import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {checker, clicker, descendants, labelled} from '../portal/backend.js';
import {keyringDialog} from './client.js';
import {SecretStore} from './secretStore.js';

const require = checker('pinentry');
const REPOSITORY = GLib.build_filenamev([GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0]), '..', '..', '..', '..']);
const PINENTRY = GLib.build_filenamev([REPOSITORY, 'kestrel/keyring/target/release/luft-pinentry']);
const PASSPHRASE = 'correct horse 7';
const USER_ID = 'Kestrel Check <check@lantharos.com>';

class GnuPG {
  constructor() {
    this.home = GLib.build_filenamev([GLib.get_user_cache_dir(), 'pinentry-gnupg']);
    GLib.mkdir_with_parents(this.home, 0o700);
    GLib.file_set_contents(`${this.home}/gpg-agent.conf`, `pinentry-program ${PINENTRY}\n`);
    this._launcher = new Gio.SubprocessLauncher({flags: Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_MERGE});
    this._launcher.setenv('GNUPGHOME', this.home, true);
    this._launcher.unsetenv('GPG_TTY');
  }

  run(argv, input = '') {
    const process = this._launcher.spawnv(argv);
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

  async destroy() {
    await this.run(['gpgconf', '--kill', 'gpg-agent']);
    Gio.Subprocess.new(['rm', '-rf', this.home], Gio.SubprocessFlags.NONE).wait(null);
  }
}

async function waitForDialog(pause) {
  for (let tries = 0; tries < 60 && !keyringDialog(); tries++) await pause(100);
  await pause(400);
  return keyringDialog();
}

async function checkNewPassphrase({gnupg, pause, capture, output, type, press}) {
  const generated = gnupg.gpg('--quick-gen-key', USER_ID, 'ed25519', 'sign', 'never');
  const dialog = await waitForDialog(pause);
  const confirm = descendants(dialog).filter(actor => actor instanceof St.PasswordEntry)[1];
  require(dialog && labelled(dialog, 'Choose a passphrase') && confirm?.mapped && !labelled(dialog, 'Save in your keyring'),
    'a new key asks for its passphrase twice in Kestrel');
  type(PASSPHRASE);
  press(Clutter.KEY_Return);
  type('correct horse');
  press(Clutter.KEY_Return);
  await pause(300);
  require(labelled(dialog, 'Does not match - try again'), 'GnuPG’s own words explain a mismatch');
  await capture(`${output}/pinentry-new-passphrase.png`);
  type(PASSPHRASE);
  press(Clutter.KEY_Return);
  const {ok} = await generated;
  require(ok, 'the key is made with the passphrase typed in Kestrel');
  await pause(400);
}

async function checkUnlock({gnupg, store, pause, capture, output, type, press, click}) {
  await gnupg.forget();
  const signed = gnupg.sign();
  const dialog = await waitForDialog(pause);
  require(dialog && labelled(dialog, 'Enter your passphrase') && labelled(dialog, 'Save in your keyring'),
    'signing asks to unlock the key and offers to save the passphrase');
  type('wrong horse');
  press(Clutter.KEY_Return);
  await pause(1200);
  require(keyringDialog() === dialog && descendants(dialog).some(actor => actor.text?.startsWith('Bad Passphrase')),
    'a wrong passphrase asks again in the same prompt');
  await capture(`${output}/pinentry-unlock.png`);
  await click(labelled(dialog, 'Save in your keyring'));
  type(PASSPHRASE);
  press(Clutter.KEY_Return);
  const {ok, output: text} = await signed;
  require(ok && text.includes('BEGIN PGP SIGNATURE'), 'the right passphrase signs');
  require(store.items.size === 1 && [...store.items.values()][0].attributes['xdg:schema'] === 'org.gnupg.Passphrase',
    'the passphrase is saved in the keyring the way GnuPG’s pinentry saves it');
  await pause(400);

  await gnupg.forget();
  const remembered = await gnupg.sign();
  require(remembered.ok && !keyringDialog(), 'a saved passphrase signs without asking');
}

async function checkQuality({gnupg, pause, capture, output, type, press}) {
  const asked = gnupg.run(['gpg-connect-agent', 'GET_PASSPHRASE --qualitybar --repeat=0 kestrel-check X Passphrase Choose%20a%20passphrase%20for%20the%20backup', '/bye']);
  const dialog = await waitForDialog(pause);
  const fill = descendants(dialog ?? global.stage).find(actor => actor.has_style_class_name?.('kestrel-quality-fill'));
  require(fill?.mapped && fill.width === 0, 'a passphrase with a quality bar starts empty');
  type(PASSPHRASE);
  await pause(600);
  require(fill.width === fill.get_parent().get_allocation_box().get_width(), 'GnuPG rates the passphrase while it’s typed and a strong one fills the bar');
  await capture(`${output}/pinentry-quality.png`);
  press(Clutter.KEY_Return);
  const {output: answer} = await asked;
  require(answer.startsWith('OK '), 'the rated passphrase is handed to GnuPG');
  await pause(400);
}

async function checkConfirm({gnupg, pause, capture, output, press}) {
  const asked = gnupg.run(['gpg-connect-agent', 'GET_CONFIRMATION Forget%20the%20saved%20passphrase%3F', '/bye']);
  const dialog = await waitForDialog(pause);
  require(dialog && labelled(dialog, 'Forget the saved passphrase?') && labelled(dialog, 'OK') && labelled(dialog, 'Cancel'),
    'confirmations ask in Kestrel');
  await capture(`${output}/pinentry-confirm.png`);
  press(Clutter.KEY_Escape);
  const {output: answer} = await asked;
  require(answer.includes('ERR') && answer.toLowerCase().includes('cancel'), 'Escape answers a confirmation with Cancel');
  await pause(400);
}

export async function checkPinentry({pause, capture, output, pointer, keyboard}) {
  require(GLib.file_test(PINENTRY, GLib.FileTest.IS_EXECUTABLE), 'Kestrel’s pinentry is built');
  const press = symbol => {
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.RELEASED);
  };
  const type = text => [...text].forEach(character => press(character.charCodeAt(0)));
  const store = new SecretStore();
  const gnupg = new GnuPG();
  try {
    require(await store.own(), 'the checks stand in for the keyring');
    const context = {gnupg, store, pause, capture, output, type, press, click: clicker(pointer, pause)};
    await checkNewPassphrase(context);
    await checkUnlock(context);
    await checkQuality(context);
    await checkConfirm(context);
  } finally {
    await gnupg.destroy();
    store.destroy();
  }
}
