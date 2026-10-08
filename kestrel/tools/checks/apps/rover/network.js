import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {ScratchKeyring} from '../../../fixtures/services/secretService.js';
import {checks} from '../../lib/check.js';
import {press, type} from '../../lib/input.js';
import {freePorts, listening} from '../../lib/ports.js';
import {scratch, spawn} from '../../lib/processes.js';
import {waitUntil} from '../../lib/wait.js';
import {changes, openApp} from '../lib/apps.js';
import {removeTree, write} from '../lib/files.js';
import {useScheme} from '../lib/palette.js';

const {require, eventually} = checks('Luft app');
const USER = 'luft';
const PASSWORD = 'hunter2';
const MOUNT_TIMEOUT = 20000;
const PATH_BAR = [760, 30];
const MORE = [1066, 26];
const CONNECT = [948, 243];
const DIALOG = {x: 380, y: 200, width: 440, height: 400};
const SHARE = {'docs/Plan.md': '# Plan\n', 'docs/Budget.csv': 'a,b\n1,2\n', 'photos/README.txt': 'Holiday photos\n', 'Notes.txt': 'Shared notes\n'};
const QUIET = Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_SILENCE;

const folder = (...parts) => scratch('rover-network', ...parts);
const mounted = scheme => Gio.VolumeMonitor.get().get_mounts().find(mount => mount.get_root().get_uri_scheme() === scheme);

async function startServers(rclone, ports) {
  for (const [name, contents] of Object.entries(SHARE)) write(folder('share', name), contents);
  const [cert, key] = [folder('cert.pem'), folder('key.pem')];
  Gio.Subprocess.new(['openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-subj', '/CN=127.0.0.1',
    '-keyout', key, '-out', cert], QUIET).wait_check(null);
  const credentials = ['--user', USER, '--pass', PASSWORD];
  spawn([rclone, 'serve', 'webdav', folder('share'), '--addr', `127.0.0.1:${ports.dav}`, '--cert', cert, '--key', key, ...credentials], {flags: QUIET});
  spawn([rclone, 'serve', 'ftp', folder('share'), '--addr', `127.0.0.1:${ports.ftp}`, ...credentials], {flags: QUIET});
  spawn(['/usr/libexec/gvfsd', '--replace'], {env: {GVFS_DISABLE_FUSE: null, XDG_RUNTIME_DIR: GLib.getenv('KESTREL_APP_RUNTIME_DIR')}, flags: QUIET});
  await waitUntil(() => listening(ports.dav) && listening(ports.ftp), 'the network shares start');
}

async function unmount(scheme) {
  const mount = mounted(scheme);
  if (!mount) return;
  await new Promise(resolve => mount.unmount_with_operation(Gio.MountUnmountFlags.FORCE, null, null, () => resolve()));
  await waitUntil(() => !mounted(scheme), `${scheme} unmounts`);
}

async function acceptCertificate(app, name, act) {
  await changes(app, 'Rover asks whether to trust the certificate', act, DIALOG);
  (await app.frame()).save(`rover-network-${name}-dark`);
  await changes(app, 'trusting the certificate asks for a password', () => {
    press(Clutter.KEY_Shift_L, Clutter.KEY_Tab);
    press(Clutter.KEY_Return);
  }, DIALOG);
  (await app.frame()).save('rover-network-sign-in-dark');
}

function signIn({remember}) {
  type(USER);
  press(Clutter.KEY_Tab);
  type(PASSWORD);
  if (remember) {
    press(Clutter.KEY_Tab);
    press(Clutter.KEY_Tab);
    press(Clutter.KEY_space);
    press(Clutter.KEY_Shift_L, Clutter.KEY_Tab);
    press(Clutter.KEY_Shift_L, Clutter.KEY_Tab);
  }
  press(Clutter.KEY_Return);
}

async function typeAddress(app, address, focus) {
  await changes(app, 'Rover lets its path be typed over', focus);
  type(address);
}

const enter = () => press(Clutter.KEY_Return);

async function checkConnections(app, keyring, ports) {
  await acceptCertificate(app, 'certificate', () => {});
  signIn({remember: true});
  await eventually(() => mounted('davs'), 'rover opens a davs:// address it was started with, after confirming the certificate and signing in', MOUNT_TIMEOUT);
  (await app.settle(() => true)).save('rover-network-dark');
  await eventually(() => keyring.items.some(item => item.secret === PASSWORD && item.attributes.user === USER && item.attributes.server === '127.0.0.1'),
    'remembering the password keeps it in the keyring');

  await typeAddress(app, `ftp://127.0.0.1:${ports.ftp}/`, () => press(Clutter.KEY_Control_L, Clutter.KEY_l));
  await changes(app, 'the FTP server asks for a password', enter, DIALOG);
  signIn({remember: false});
  await eventually(() => mounted('ftp'), 'typing an ftp:// address after Ctrl+L replaces the path and connects', MOUNT_TIMEOUT);
  (await app.settle(() => true)).save('rover-network-sidebar-dark');

  await unmount('davs');
  keyring.forget();
  await typeAddress(app, `davs://127.0.0.1:${ports.dav}/docs`, () => app.click(PATH_BAR));
  await acceptCertificate(app, 'certificate-again', enter);
  signIn({remember: false});
  await eventually(() => mounted('davs'), 'typing an address after clicking the path bar replaces the path and connects', MOUNT_TIMEOUT);
  (await app.settle(() => true)).save('rover-network-docs-dark');

  await changes(app, 'the more menu opens', () => app.click(MORE));
  await changes(app, 'Connect to server opens', () => app.click(CONNECT));
  (await app.frame()).save('rover-connect-dark');
  await changes(app, 'the connect dialog follows the light style', () => useScheme('light'));
  (await app.frame()).save('rover-connect-light');
  press(Clutter.KEY_Escape);
}

export async function checkNetwork(rclone) {
  const ports = freePorts('dav', 'ftp');
  const keyring = new ScratchKeyring();
  require(await keyring.own(), 'a scratch keyring stands in for the Secret Service');
  let app = null;
  try {
    await startServers(rclone, ports);
    useScheme('dark');
    app = await openApp('rover', [`davs://127.0.0.1:${ports.dav}/`]);
    await checkConnections(app, keyring, ports);
  } finally {
    await app?.close();
    await unmount('davs');
    await unmount('ftp');
    keyring.close();
    removeTree(folder());
  }
}
