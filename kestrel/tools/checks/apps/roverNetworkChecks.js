import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {ScratchKeyring} from '../../fixtures/services/secretService.js';
import {LuftApp, sleep, waitFor} from './luftApp.js';

const USER = 'luft';
const PASSWORD = 'hunter2';
const DAV_PORT = 47811;
const FTP_PORT = 47812;
const SETTLE = 900;
const MOUNT_TIMEOUT = 20000;
const PATH_BAR = [760, 30];
const MORE = [1066, 26];
const CONNECT = [948, 243];
const SHARE = {'docs/Plan.md': '# Plan\n', 'docs/Budget.csv': 'a,b\n1,2\n', 'photos/README.txt': 'Holiday photos\n', 'Notes.txt': 'Shared notes\n'};

const scratch = (...parts) => GLib.build_filenamev([GLib.get_user_cache_dir(), 'rover-network', ...parts]);

function writeShare() {
  for (const [name, contents] of Object.entries(SHARE)) {
    GLib.mkdir_with_parents(GLib.path_get_dirname(scratch('share', name)), 0o755);
    GLib.file_set_contents(scratch('share', name), contents);
  }
}

function spawn(argv, environment = {}) {
  const launcher = new Gio.SubprocessLauncher({flags: Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_SILENCE});
  for (const [name, value] of Object.entries(environment)) {
    if (value === null) launcher.unsetenv(name);
    else launcher.setenv(name, value, true);
  }
  return launcher.spawnv(argv);
}

function certificate() {
  const [cert, key] = [scratch('cert.pem'), scratch('key.pem')];
  const openssl = Gio.Subprocess.new(['openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-subj', '/CN=127.0.0.1',
    '-keyout', key, '-out', cert], Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_SILENCE);
  openssl.wait_check(null);
  return [cert, key];
}

function startServers(rclone) {
  writeShare();
  const [cert, key] = certificate();
  const share = scratch('share');
  const credentials = ['--user', USER, '--pass', PASSWORD];
  return [
    spawn([rclone, 'serve', 'webdav', share, '--addr', `127.0.0.1:${DAV_PORT}`, '--cert', cert, '--key', key, ...credentials]),
    spawn([rclone, 'serve', 'ftp', share, '--addr', `127.0.0.1:${FTP_PORT}`, ...credentials]),
  ];
}

function startVfs() {
  return spawn(['/usr/libexec/gvfsd', '--replace'], {GVFS_DISABLE_FUSE: null, XDG_RUNTIME_DIR: GLib.getenv('KESTREL_APP_RUNTIME_DIR')});
}

const mounted = scheme => Gio.VolumeMonitor.get().get_mounts().find(mount => mount.get_root().get_uri_scheme() === scheme);

async function unmount(scheme) {
  const mount = mounted(scheme);
  if (!mount) return;
  await new Promise(resolve => mount.unmount_with_operation(Gio.MountUnmountFlags.FORCE, null, null, () => resolve()));
  await waitFor(() => !mounted(scheme), 5000, () => `${scheme} stayed mounted`);
}

class Keys {
  constructor() {
    this.device = global.stage.context.get_backend().get_default_seat().create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
  }

  press(keyval, modifiers = []) {
    for (const modifier of modifiers) this.device.notify_keyval(GLib.get_monotonic_time(), modifier, Clutter.KeyState.PRESSED);
    this.device.notify_keyval(GLib.get_monotonic_time(), keyval, Clutter.KeyState.PRESSED);
    this.device.notify_keyval(GLib.get_monotonic_time(), keyval, Clutter.KeyState.RELEASED);
    for (const modifier of modifiers.toReversed()) this.device.notify_keyval(GLib.get_monotonic_time(), modifier, Clutter.KeyState.RELEASED);
  }

  async type(text) {
    for (const character of text) this.press(character.codePointAt(0));
    await sleep(SETTLE / 3);
  }
}

async function acceptCertificate(app, keys, output, name) {
  await sleep(SETTLE * 2);
  (await app.settle(() => true)).save(`${output}/rover-network-${name}-dark.png`);
  keys.press(Clutter.KEY_Tab, [Clutter.KEY_Shift_L]);
  keys.press(Clutter.KEY_Return);
}

async function signIn(app, keys, output, {remember}) {
  await sleep(SETTLE * 2);
  (await app.settle(() => true)).save(`${output}/rover-network-sign-in-dark.png`);
  await keys.type(USER);
  keys.press(Clutter.KEY_Tab);
  await keys.type(PASSWORD);
  if (remember) {
    keys.press(Clutter.KEY_Tab);
    keys.press(Clutter.KEY_Tab);
    keys.press(Clutter.KEY_space);
    keys.press(Clutter.KEY_Tab, [Clutter.KEY_Shift_L]);
    keys.press(Clutter.KEY_Tab, [Clutter.KEY_Shift_L]);
  }
  keys.press(Clutter.KEY_Return);
}

async function click(pointer, app, [x, y]) {
  const frame = app.window.get_frame_rect();
  pointer.notify_absolute_motion(GLib.get_monotonic_time(), frame.x + x, frame.y + y);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
  await sleep(SETTLE);
}

async function openAddress(app, keys, pointer, address, {byClick}) {
  if (byClick) {
    await click(pointer, app, PATH_BAR);
  } else {
    keys.press(Clutter.KEY_l, [Clutter.KEY_Control_L]);
  }
  await sleep(SETTLE / 2);
  await keys.type(address);
  keys.press(Clutter.KEY_Return);
}

async function checkConnections(app, keyring, {styles, require, output, pointer}) {
  const keys = new Keys();
  await app.open();
  await acceptCertificate(app, keys, output, 'certificate');
  await signIn(app, keys, output, {remember: true});
  await waitFor(() => mounted('davs'), MOUNT_TIMEOUT, () => 'the WebDAV share never mounted');
  await sleep(SETTLE);
  (await app.settle(() => true)).save(`${output}/rover-network-dark.png`);
  require(true, 'rover opens a davs:// address it was started with, after confirming the certificate and signing in');
  const remembered = () => keyring.items.some(item => item.secret === PASSWORD && item.attributes.user === USER && item.attributes.server === '127.0.0.1');
  await waitFor(remembered, 5000, () => `the keyring holds ${JSON.stringify(keyring.items.map(item => item.attributes))}`);
  require(remembered(), 'remembering the password keeps it in the keyring');

  await openAddress(app, keys, pointer, `ftp://127.0.0.1:${FTP_PORT}/`, {byClick: false});
  await signIn(app, keys, output, {remember: false});
  await waitFor(() => mounted('ftp'), MOUNT_TIMEOUT, () => 'the FTP server never mounted');
  require(true, 'typing an ftp:// address after Ctrl+L replaces the path and connects');
  await sleep(SETTLE);
  (await app.settle(() => true)).save(`${output}/rover-network-sidebar-dark.png`);

  await unmount('davs');
  keyring.forget();
  await openAddress(app, keys, pointer, `davs://127.0.0.1:${DAV_PORT}/docs`, {byClick: true});
  await acceptCertificate(app, keys, output, 'certificate-again');
  await signIn(app, keys, output, {remember: false});
  await waitFor(() => mounted('davs'), MOUNT_TIMEOUT, () => 'the WebDAV share never mounted again');
  require(true, 'typing an address after clicking the path bar replaces the path and connects');
  await sleep(SETTLE);
  (await app.settle(() => true)).save(`${output}/rover-network-docs-dark.png`);

  await click(pointer, app, MORE);
  await click(pointer, app, CONNECT);
  (await app.settle(() => true)).save(`${output}/rover-connect-dark.png`);
  styles.interface.set_string('color-scheme', 'prefer-light');
  await sleep(SETTLE);
  (await app.settle(() => true)).save(`${output}/rover-connect-light.png`);
  keys.press(Clutter.KEY_Escape);
}

export async function checkRoverNetwork(context) {
  const rclone = GLib.find_program_in_path('rclone');
  if (!rclone) {
    console.log('Kestrel Luft app check: rover network locations skipped without rclone');
    return;
  }
  context.styles.interface.set_string('color-scheme', 'prefer-dark');
  const keyring = new ScratchKeyring();
  context.require(await keyring.own(), 'a scratch keyring stands in for the Secret Service');
  const processes = [...startServers(rclone), startVfs()];
  const app = new LuftApp('rover', [`davs://127.0.0.1:${DAV_PORT}/`]);
  try {
    await sleep(SETTLE);
    await checkConnections(app, keyring, context);
  } finally {
    await app.close();
    await unmount('davs');
    await unmount('ftp');
    for (const process of processes) process.send_signal(15);
    keyring.close();
    GLib.spawn_command_line_sync(`rm -rf ${GLib.shell_quote(scratch())}`);
  }
}
