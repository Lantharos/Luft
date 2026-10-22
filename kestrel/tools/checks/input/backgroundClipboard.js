import Clutter from 'gi://Clutter';
import St from 'gi://St';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {BACKGROUND_CLIPBOARD, answer, forget, withFullAccess} from '../lib/access/permissions.js';
import {press} from '../lib/input/input.js';
import {fixture, gjs, stop, waitForWindow} from '../lib/processes.js';
import {bubblewrapped, inAppScope, launch, openSecurityContext, through} from '../lib/access/sandbox.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('background clipboard');
const clipboard = St.Clipboard.get_default();
const CLIENT = fixture('clients', 'wayland', 'dataControlClient.py');
const PASSWORD_MANAGER = 'com.onepassword.OnePassword';
const NOTES_APP = 'org.example.Notes';
const PASSWORD = 'lighthouse-keeper-42';

const clipboardText = () => new Promise(resolve => clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clipboard, text) => resolve(text)));

async function startClient({prefix = [], args = [], socket = null} = {}) {
  const {process, lines} = await launch([...prefix, 'python3', CLIENT, ...args], {env: through(socket), label: 'the clipboard client connects'});
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
  const app = gjs('clients/x11/x11Window.js', ['Kestrel X11 copy', '#2f5d8a', 'Copied in X11']);
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

async function checkFlatpaks() {
  const notes = await openSecurityContext(NOTES_APP);
  const passwords = await openSecurityContext(PASSWORD_MANAGER);
  try {
    require(notes.listening && passwords.listening, 'sandbox engines can give their apps sockets of their own');

    const untrusted = await startClient({socket: notes.socket});
    require(!untrusted.available, 'sandboxed apps cannot use the clipboard from the background');
    await stop(untrusted.process);

    await withFullAccess(NOTES_APP, async () => {
      const opened = await startClient({socket: notes.socket});
      require(opened.available, 'apps with full access can use the clipboard from the background');
      await stop(opened.process);
    });
    const closed = await startClient({socket: notes.socket});
    require(!closed.available, 'taking full access away takes the clipboard away from the background again');
    await stop(closed.process);

    const nested = await openSecurityContext(PASSWORD_MANAGER, {socket: notes.socket});
    require(!nested.listening, 'sandboxed apps cannot open sockets that pass as another app');
    await stop(nested.process);

    const manager = await startClient({socket: passwords.socket});
    try {
      require(manager.available, 'sandboxed password managers can use the clipboard from the background');
      await manager.send('copy plain Boarding pass', 'copied');
      await eventually(async () => await clipboardText() === 'Boarding pass', 'a sandboxed password manager copies text');
    } finally {
      await stop(manager.process);
    }
    await checkStoredAnswers(notes.socket, passwords.socket);
  } finally {
    await Promise.all([stop(notes.process), stop(passwords.process)]);
  }
}

async function available(socket) {
  const client = await startClient({socket});
  await stop(client.process);
  return client.available;
}

async function checkStoredAnswers(notes, passwords) {
  await answer(BACKGROUND_CLIPBOARD, PASSWORD_MANAGER, false);
  try {
    require(!await available(passwords), 'a password manager turned off in Settings loses the clipboard in the background');
  } finally {
    await forget(BACKGROUND_CLIPBOARD, PASSWORD_MANAGER, true);
  }
  require(await available(passwords), 'forgetting the answer gives a password manager the clipboard again');

  await answer(BACKGROUND_CLIPBOARD, NOTES_APP, true);
  try {
    require(await available(notes), 'any app allowed in Settings can use the clipboard from the background');
  } finally {
    await forget(BACKGROUND_CLIPBOARD, NOTES_APP);
  }
  require(!await available(notes), 'forgetting the answer takes the clipboard away from the background again');
}

async function checkImpostors() {
  const scoped = await startClient({prefix: inAppScope(PASSWORD_MANAGER, bubblewrapped(NOTES_APP))});
  require(!scoped.available, 'a sandboxed app in a scope named after a password manager cannot use the clipboard from the background');
  await stop(scoped.process);

  const handoff = await startClient({prefix: bubblewrapped(NOTES_APP), args: ['--handoff']});
  require(!handoff.available, 'a sandboxed app cannot use the clipboard by leaving its connection to a child');
  await stop(handoff.process);

  const engine = await openSecurityContext(PASSWORD_MANAGER, {prefix: bubblewrapped(PASSWORD_MANAGER)});
  require(!engine.listening, 'sandboxed apps cannot open sockets of their own');
  await stop(engine.process);
}

export async function run() {
  const client = await startClient({args: ['--undumpable']});
  try {
    require(client.available, 'apps outside a sandbox can use the clipboard from the background, even ones that keep other processes out of their memory');
    await checkPasswordManager(client);
    await checkX11(client);
  } finally {
    await stop(client.process);
  }
  await checkFlatpaks();
  await checkImpostors();
}
