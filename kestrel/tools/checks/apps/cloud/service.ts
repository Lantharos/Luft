import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {ScratchAppSecrets} from '../../../fixtures/services/appSecrets.js';
import {ScratchUserManager} from '../../../fixtures/services/userManager.js';
import {checks} from '../../lib/check.js';
import {call} from '../../lib/dbus.js';
import {prepareHome} from '../../lib/apps/home.js';
import {freePorts, listening} from '../../lib/apps/ports.js';
import {repository, scratch, spawn} from '../../lib/processes.js';
import {waitUntil} from '../../lib/wait.js';
import {removeTree, write} from '../lib/files.js';

const {require} = checks('Luft app');
const NAME = 'com.lantharos.Accounts1';
const UNIT = 'luft-accounts.service';
const PATH = '/com/lantharos/Accounts1';
const ACCOUNTS = 'com.lantharos.Accounts1';
const FILES = 'com.lantharos.Accounts1.Files';
const SERVICE = repository('target/release/luft-accounts');
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

export interface Drive {
  name: string;
  path: string;
  state: string;
}

interface Step {
  step: string;
  message?: string;
}

export type Cloud = Awaited<ReturnType<typeof startCloud>>;

const folder = (...parts: string[]) => scratch('cloud', ...parts);

async function json<T>(iface: string, method: string, parameters: GLib.Variant | null = null): Promise<T> {
  const reply = await call(NAME, PATH, iface, method, parameters, '(s)');
  return JSON.parse(reply.deepUnpack()[0]);
}

const owned = async () => (await call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'NameHasOwner',
  new GLib.Variant('(s)', [NAME]), '(b)')).deepUnpack()[0];

export const drives = () => json<Drive[]>(FILES, 'Drives');
export const states = (path: string) => json<Record<string, string>>(FILES, 'States', new GLib.Variant('(s)', [path]));
export const keep = (paths: string[]) => call(NAME, PATH, FILES, 'Keep', new GLib.Variant('(as)', [paths]));

export async function startCloud(rclone: string) {
  for (const [name, contents] of Object.entries(FILES_ON_SERVER)) write(folder('server', name), contents);
  const ports = freePorts('dav');
  spawn([rclone, 'serve', 'webdav', folder('server'), '--addr', `127.0.0.1:${ports.dav}`, '--user', USER, '--pass', PASSWORD], {flags: QUIET});
  await waitUntil(() => listening(ports.dav), 'the WebDAV server starts');
  const keyring = new ScratchAppSecrets({});
  require(await keyring.own(), 'a scratch keyring stands in for Luft Keyring');
  const userManager = new ScratchUserManager();
  require(await userManager.own(), 'a scratch user manager stands in for systemd');
  const service = spawn([SERVICE], {
    env: {
      HOME: prepareHome(),
      XDG_RUNTIME_DIR: GLib.getenv('KESTREL_APP_RUNTIME_DIR'),
      PATH: `${GLib.path_get_dirname(rclone)}:${GLib.getenv('PATH')}`,
    },
  });
  await waitUntil(owned, 'the accounts service starts');
  return {
    server: `http://127.0.0.1:${ports.dav}`,
    keyring,
    userManager,
    async stop() {
      service.send_signal(15);
      await service.exited;
      keyring.close();
      userManager.close();
      removeTree(folder());
    },
  };
}

export async function signIn(cloud: Cloud) {
  const credentials = JSON.stringify({server: cloud.server, user: USER, password: PASSWORD});
  const session = (await call(NAME, PATH, ACCOUNTS, 'SignIn', new GLib.Variant('(ss)', ['webdav', credentials]), '(s)')).deepUnpack()[0];
  const step = await waitUntil(async () => {
    const current = await json<Step>(ACCOUNTS, 'Step', new GLib.Variant('(s)', [session]));
    return (current.step === 'done' || current.step === 'failed') && current;
  }, 'signing in to the WebDAV server finishes', SIGN_IN_TIMEOUT);
  require(step.step === 'done', `signing in to a WebDAV server with its password works (${step.message ?? ''})`);
  require([...cloud.keyring.secrets.values()].some(secret => secret.includes(PASSWORD)), 'the password is kept in the keyring');
  require(cloud.userManager.enabled.has(UNIT), 'the first account turns the accounts service on at sign-in');
  await waitUntil(async () => (await drives())[0]?.state === 'ready', 'the WebDAV drive mounts', SIGN_IN_TIMEOUT);
  return (await drives())[0];
}
