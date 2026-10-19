import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {ScratchAppSecrets} from '../../../fixtures/services/appSecrets.js';
import {checks} from '../../lib/check.js';
import {call} from '../../lib/dbus.js';
import {prepareHome} from '../../lib/home.js';
import {freePorts, listening} from '../../lib/ports.js';
import {repository, scratch, spawn} from '../../lib/processes.js';
import {waitUntil} from '../../lib/wait.js';
import {removeTree, write} from '../lib/files.js';

const {require} = checks('Luft app');
const NAME = 'com.lantharos.Accounts1';
const PATH = '/com/lantharos/Accounts1';
const ACCOUNTS = 'com.lantharos.Accounts1';
const FILES = 'com.lantharos.Accounts1.Files';
const SERVICE = repository('packages/accounts/service/target/release/luft-accounts');
const USER = 'ada';
const PASSWORD = 'correct-horse';
const SIGN_IN_TIMEOUT = 30000;
const QUIET = Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_SILENCE;
const FILES_ON_SERVER = {
  'Documents/Plan.md': '# Plan\n\n- Book the ferry\n- Pack the charger\n',
  'Documents/Budget.csv': 'Month,Rent,Food\nJanuary,950,310\n',
  'Photos/README.txt': 'Holiday photos\n',
  'Notes.txt': 'Shared notes\n',
};

const folder = (...parts) => scratch('cloud', ...parts);

async function json(iface, method, parameters = null) {
  const reply = await call(NAME, PATH, iface, method, parameters, '(s)');
  return JSON.parse(reply.deepUnpack()[0]);
}

const owned = async () => (await call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'NameHasOwner',
  new GLib.Variant('(s)', [NAME]), '(b)')).deepUnpack()[0];

export const drives = () => json(FILES, 'Drives');
export const accounts = () => json(ACCOUNTS, 'Accounts');
export const states = path => json(FILES, 'States', new GLib.Variant('(s)', [path]));
export const keep = paths => call(NAME, PATH, FILES, 'Keep', new GLib.Variant('(as)', [paths]));

export async function startCloud(rclone) {
  for (const [name, contents] of Object.entries(FILES_ON_SERVER)) write(folder('server', name), contents);
  const ports = freePorts('dav');
  spawn([rclone, 'serve', 'webdav', folder('server'), '--addr', `127.0.0.1:${ports.dav}`, '--user', USER, '--pass', PASSWORD], {flags: QUIET});
  await waitUntil(() => listening(ports.dav), 'the WebDAV server starts');
  const keyring = new ScratchAppSecrets({});
  require(await keyring.own(), 'a scratch keyring stands in for Luft Keyring');
  const service = spawn([SERVICE], {
    env: {
      HOME: prepareHome(),
      XDG_RUNTIME_DIR: GLib.getenv('KESTREL_APP_RUNTIME_DIR'),
      DBUS_SYSTEM_BUS_ADDRESS: GLib.getenv('KESTREL_SYSTEM_BUS'),
      PATH: `${GLib.path_get_dirname(rclone)}:${GLib.getenv('PATH')}`,
    },
  });
  await waitUntil(owned, 'the accounts service starts');
  return {
    server: `http://127.0.0.1:${ports.dav}`,
    keyring,
    async stop() {
      service.send_signal(15);
      await service.exited;
      keyring.close();
      removeTree(folder());
    },
  };
}

export async function signIn(cloud) {
  const credentials = JSON.stringify({server: cloud.server, user: USER, password: PASSWORD});
  const session = (await call(NAME, PATH, ACCOUNTS, 'SignIn', new GLib.Variant('(ss)', ['webdav', credentials]), '(s)')).deepUnpack()[0];
  let step = null;
  await waitUntil(async () => {
    step = await json(ACCOUNTS, 'Step', new GLib.Variant('(s)', [session]));
    return step.step === 'done' || step.step === 'failed';
  }, 'signing in to the WebDAV server finishes', SIGN_IN_TIMEOUT);
  require(step.step === 'done', `signing in to a WebDAV server with its password works (${step.message ?? ''})`);
  require([...cloud.keyring.secrets.values()].some(secret => secret.includes(PASSWORD)), 'the password is kept in the keyring');
  await waitUntil(async () => (await drives())[0]?.state === 'ready', 'the WebDAV drive mounts', SIGN_IN_TIMEOUT);
  return (await drives())[0];
}
