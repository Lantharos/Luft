import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {press} from '../lib/input.js';
import {fixture, gjs, outputLines, scratch, spawn, stop, waitForWindow} from '../lib/processes.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('background clipboard');
const clipboard = St.Clipboard.get_default();
const CLIENT = fixture('clients', 'wayland', 'dataControlClient.py');
const TRUSTED_APP = 'com.onepassword.OnePassword';
const UNTRUSTED_APP = 'org.example.Notes';
const PASSWORD = 'lighthouse-keeper-42';

const clipboardText = () => new Promise(resolve => clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clipboard, text) => resolve(text)));

function sandboxed(appId) {
  const info = scratch(`flatpak-info-${appId}`);
  GLib.file_set_contents(info, `[Application]\nname=${appId}\n`);
  const runtime = GLib.get_user_runtime_dir();
  return ['bwrap', '--ro-bind', '/usr', '/usr', '--symlink', 'usr/lib64', '/lib64', '--symlink', 'usr/lib', '/lib', '--symlink', 'usr/bin', '/bin',
    '--proc', '/proc', '--dev', '/dev', '--bind', runtime, runtime, '--ro-bind', fixture('clients'), fixture('clients'), '--ro-bind', info, '/.flatpak-info'];
}

async function startClient(prefix = []) {
  const process = spawn([...prefix, 'python3', CLIENT], {flags: Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE});
  const lines = outputLines(process);
  await eventually(() => lines.length > 0, 'the clipboard client connects');
  const send = async (command, answer) => {
    const seen = lines.length;
    process.get_stdin_pipe().write_all(`${command}\n`, null);
    await eventually(() => lines.slice(seen).some(line => line.startsWith(answer)), `the clipboard client answers ${command}`);
    return lines.slice(seen).find(line => line.startsWith(answer)).slice(answer.length).trim();
  };
  return {process, available: lines[0] === 'ready', send};
}

async function historyTexts() {
  const panel = named('kestrel-clipboard');
  toggleSurface('clipboard');
  await eventually(() => shown(panel), 'clipboard history opens');
  await settled();
  const texts = panel.get_first_child().child.get_children().map(row => row.accessible_name);
  press(Clutter.KEY_Escape);
  await eventually(() => !panel.visible, 'clipboard history closes');
  return texts;
}

async function checkPasswordManager(client) {
  clipboard.set_text(St.ClipboardType.CLIPBOARD, 'Ferry leaves at seven');
  require(await client.send('paste', 'pasted') === 'Ferry leaves at seven', 'a background app reads the clipboard');

  await client.send('copy plain Pier 4, gate B', 'copied');
  await eventually(async () => await clipboardText() === 'Pier 4, gate B', 'a background app copies text');
  await eventually(async () => (await historyTexts()).includes('Pier 4, gate B'), 'text a background app copies lands in clipboard history');

  await client.send(`copy secret ${PASSWORD}`, 'copied');
  await eventually(async () => await clipboardText() === PASSWORD, 'a password manager copies a password');
  require(!(await historyTexts()).includes(PASSWORD), 'passwords marked secret stay out of clipboard history');

  await client.send('clear', 'cleared');
  await eventually(async () => !await clipboardText(), 'a password manager clears the clipboard from the background');
  require(!(await historyTexts()).includes(PASSWORD), 'the cleared password is nowhere in clipboard history');
}

async function checkX11(client) {
  const app = gjs('clients/x11Window.js', ['Kestrel X11 copy', '#2f5d8a', 'Copied in X11']);
  try {
    const window = await waitForWindow('Kestrel X11 copy');
    await eventually(async () => await client.send('paste', 'pasted') === 'Copied in X11', 'background apps read what X11 apps copy');
    await eventually(() => window.has_focus(), 'the X11 app takes focus');
    press(Clutter.KEY_c);
    await eventually(async () => await client.send('paste', 'pasted') === '', 'an X11 app clears its own copy');
  } finally {
    await stop(app);
  }
}

async function checkSandbox() {
  const untrusted = await startClient(sandboxed(UNTRUSTED_APP));
  require(!untrusted.available, 'sandboxed apps cannot use the clipboard from the background');
  await stop(untrusted.process);

  const trusted = await startClient(sandboxed(TRUSTED_APP));
  try {
    require(trusted.available, 'sandboxed password managers can use the clipboard from the background');
    await trusted.send('copy plain Boarding pass', 'copied');
    await eventually(async () => await clipboardText() === 'Boarding pass', 'a sandboxed password manager copies text');
  } finally {
    await stop(trusted.process);
  }
}

export async function run() {
  const client = await startClient();
  try {
    require(client.available, 'apps outside a sandbox can use the clipboard from the background');
    await checkPasswordManager(client);
    await checkX11(client);
  } finally {
    await stop(client.process);
  }
  await checkSandbox();
}
