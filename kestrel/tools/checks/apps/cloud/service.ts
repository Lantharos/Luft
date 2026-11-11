import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {ScratchAppSecrets} from '../../../fixtures/services/appSecrets.js';
import {ScratchUserManager} from '../../../fixtures/services/userManager.js';
import {checks} from '../../lib/check.js';
import {call} from '../../lib/dbus.js';
import {prepareHome} from '../../lib/apps/home.js';
import {freePorts, listening} from '../../lib/apps/ports.js';
import {builtFixture, outcome, repository, scratch, spawn} from '../../lib/processes.js';
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
const ACCOUNTS_CLIENT = builtFixture('clients', 'apps', 'accountsClient.js');
const ACCESS_DENIED = 'com.lantharos.Accounts1.Error.NotAuthorized';

const STAND_INS = {
  settings: folder('luft-apps', 'settings'),
  rover: folder('luft-apps', 'rover'),
  impostor: folder('impostor', 'settings'),
};

type Program = keyof typeof STAND_INS;

function standIn(program: Program): string {
  const path = STAND_INS[program];
  if (!GLib.file_test(path, GLib.FileTest.EXISTS)) {
    GLib.mkdir_with_parents(GLib.path_get_dirname(path), 0o755);
    Gio.File.new_for_path(GLib.find_program_in_path('gjs')!).copy(Gio.File.new_for_path(path), Gio.FileCopyFlags.NONE, null, null);
  }
  return path;
}

async function callAs(program: Program, iface: string, method: string, signature = '', values: unknown[] = [], passwordFile = '') {
  return outcome([standIn(program), '-m', ACCOUNTS_CLIENT, iface, method, signature, JSON.stringify(values), passwordFile]);
}

async function reply<T>(iface: string, method: string, signature = '', values: unknown[] = [], passwordFile = ''): Promise<T> {
  const answer = await callAs('settings', iface, method, signature, values, passwordFile);
  if (!answer.ok) throw new Error(`${iface}.${method} failed: ${answer.stderr}`);
  return JSON.parse(answer.stdout) as T;
}

async function json<T>(iface: string, method: string, signature = '', values: unknown[] = []): Promise<T> {
  const [text] = await reply<[string]>(iface, method, signature, values);
  return JSON.parse(text) as T;
}

const owned = async () => (await call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'NameHasOwner',
  new GLib.Variant('(s)', [NAME]), '(b)')).deepUnpack()[0];

export const drives = () => json<Drive[]>(FILES, 'Drives');
export const states = (path: string) => json<Record<string, string>>(FILES, 'States', '(s)', [path]);
export const keep = (paths: string[]) => reply(FILES, 'Keep', '(as)', [paths]);

export async function startCloud(rclone: string) {
  for (const [name, contents] of Object.entries(FILES_ON_SERVER)) write(folder('server', name), contents);
  const ports = freePorts('dav');
  spawn([rclone, 'serve', 'webdav', folder('server'), '--addr', `127.0.0.1:${ports.dav}`, '--user', USER, '--pass', PASSWORD], {flags: QUIET});
  await waitUntil(() => listening(ports.dav), 'the WebDAV server starts');
  const keyring = new ScratchAppSecrets('com.lantharos.accounts', {});
  require(await keyring.own(), 'a scratch keyring stands in for Luft Keyring');
  const userManager = new ScratchUserManager();
  require(await userManager.own(), 'a scratch user manager stands in for systemd');
  const service = spawn([SERVICE], {
    env: {
      HOME: prepareHome(),
      XDG_RUNTIME_DIR: GLib.getenv('KESTREL_APP_RUNTIME_DIR'),
      PATH: `${GLib.path_get_dirname(rclone)}:${GLib.getenv('PATH')}`,
      KESTREL_LUFT_APPS: `${GLib.getenv('KESTREL_LUFT_APPS')}:${folder('luft-apps')}`,
    },
  });
  await waitUntil(owned, 'the accounts service starts');
  await checkAdmission();
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

async function refused(program: Program, iface: string, method: string) {
  const answer = await callAs(program, iface, method);
  return !answer.ok && answer.stderr === ACCESS_DENIED;
}

async function checkAdmission() {
  const fromKestrel = await call(NAME, PATH, ACCOUNTS, 'Accounts', null, '(s)').then(() => null, error => Gio.DBusError.get_remote_error(error));
  require(fromKestrel === ACCESS_DENIED, 'a program that is neither Settings nor Rover can\'t list your online accounts');
  require(await refused('impostor', ACCOUNTS, 'Accounts'), 'a copy of a program named after Settings outside Luft\'s own programs is refused');
  require(await refused('rover', ACCOUNTS, 'Accounts'), 'Rover can\'t change your online accounts');
  require((await callAs('rover', FILES, 'Drives')).ok, 'Rover lists the cloud drives');
  require((await callAs('settings', ACCOUNTS, 'Accounts')).ok, 'Settings lists your online accounts');
}

async function signInWithPassword(credentials: string): Promise<string> {
  const path = folder('typed-password');
  write(path, PASSWORD);
  try {
    const [session] = await reply<[string]>(ACCOUNTS, 'SignIn', '(ssh)', ['webdav', credentials, 0], path);
    return session;
  } finally {
    GLib.unlink(path);
  }
}

export async function signIn(cloud: Cloud) {
  const session = await signInWithPassword(JSON.stringify({server: cloud.server, user: USER}));
  const step = await waitUntil(async () => {
    const current = await json<Step>(ACCOUNTS, 'Step', '(s)', [session]);
    return (current.step === 'done' || current.step === 'failed') && current;
  }, 'signing in to the WebDAV server finishes', SIGN_IN_TIMEOUT);
  require(step.step === 'done', `signing in to a WebDAV server with its password works (${step.message ?? ''})`);
  require([...cloud.keyring.secrets.values()].some(secret => secret.includes(PASSWORD)), 'the password is kept in the keyring');
  require(cloud.userManager.enabled.has(UNIT), 'the first account turns the accounts service on at sign-in');
  await waitUntil(async () => (await drives())[0]?.state === 'ready', 'the WebDAV drive mounts', SIGN_IN_TIMEOUT);
  return (await drives())[0];
}
