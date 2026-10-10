import GdkPixbuf from 'gi://GdkPixbuf';
import GLib from 'gi://GLib';

import {descendants, labelled, named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click} from '../lib/input.js';
import {fixture, findWindow, gjs, scratch, waitForWindow} from '../lib/processes.js';
import {capture, output} from '../lib/screenshots.js';
import {settled, waitUntil} from '../lib/wait.js';
import {KeyringClient, SecretPipe, handle, keyringDialog, openedDialog} from '../keyring/lib/client.js';
import {look, lookDialog, oldScreenshot, stopProcess} from './lib/look.js';

const {require, eventually} = checks('look');
const TARGET = 'Look target';
const OTHER = 'Look other';
const BUSY = 'The screen is locked, or a prompt or menu is open on it';
const SCREENSHOT_REFUSAL = 'Screenshots are limited to the system. To see or use windows, run luft-look --help';

const titled = title => window => window.get_title() === title;
const pngSize = path => {
  const pixbuf = GdkPixbuf.Pixbuf.new_from_file(path);
  return [pixbuf.get_width(), pixbuf.get_height()];
};

async function answer(button, label) {
  const dialog = await waitUntil(lookDialog, label);
  await settled();
  click(labelled(button, dialog));
  await eventually(() => !lookDialog(), `${button} closes the prompt`);
  return dialog;
}

async function checkRun() {
  const log = scratch('look-target.log');
  const started = await look('run', '--wait-window', '--log', log, '--', 'gjs', '-m', fixture('clients', 'lookTarget.js'), TARGET);
  require(started.ok, `luft-look run starts a program and waits for its window (${started.stderr})`);
  const [, pid] = /^Started process (\d+) in luft-look-\d+\.scope$/m.exec(started.stdout) ?? [];
  const window = findWindow(titled(TARGET));
  require(pid && window && started.stdout.includes(`${window.get_id()} `), 'run prints the process and its first window');
  require(!!window.get_compositor_private()?.mapped, 'the program keeps running after luft-look exits');

  const listed = await look('list', '--json');
  const entry = JSON.parse(listed.stdout).find(candidate => candidate.id === window.get_id());
  require(entry?.access === 'use' && entry.launched && entry.title === TARGET, 'list shows the launched window as usable');
  return {pid: Number(pid), window, entry};
}

async function checkCapture({entry}) {
  const shot = await look('window', 'launched', '-o', output('look-window'));
  require(shot.ok && shot.stdout === output('look-window'), 'window saves a picture of the launched window and prints its path');
  const [width, height] = pngSize(shot.stdout);
  require(width === entry.width && height === entry.height, 'the picture is exactly the window');

  const fallback = await look('window', String(entry.id));
  require(fallback.ok && GLib.file_test(fallback.stdout, GLib.FileTest.EXISTS), 'pictures go to a temporary folder by default');
  GLib.unlink(fallback.stdout);
}

async function checkInput({window, entry}) {
  const press = await look('click', 'launched', String(entry.width / 2), String(Math.round(entry.height * 0.85)));
  require(press.ok, `click reaches the launched window (${press.stderr})`);
  await eventually(() => window.get_title() === `${TARGET}: pressed 1`, 'the click presses the button under the point');

  require((await look('click', 'launched', String(entry.width / 2), String(Math.round(entry.height * 0.4)))).ok, 'click focuses the text field');
  require((await look('type', 'launched', 'hello look')).ok, 'type sends text');
  await eventually(() => window.get_title() === `${TARGET}: hello look`, 'the typed text lands in the field');
  require((await look('key', 'launched', 'ctrl+a')).ok && (await look('type', 'launched', 'swapped')).ok, 'key sends a combination');
  await eventually(() => window.get_title() === `${TARGET}: swapped`, 'ctrl+a selects the text so typing replaces it');

  const outside = await look('click', 'launched', String(entry.width + 10), '10');
  require(!outside.ok && outside.stderr.includes('outside the window'), 'points outside the window are refused');
}

async function checkPrompt() {
  gjs('clients/lookTarget.js', [OTHER]);
  const other = await waitForWindow(titled(OTHER));
  const id = String(other.get_id());

  const listed = JSON.parse((await look('list', '--json')).stdout).find(candidate => candidate.id === other.get_id());
  require(listed?.access === 'ask' && listed.title === '', 'other windows hide their title until they may be seen');

  const refused = look('window', id);
  const dialog = await waitUntil(lookDialog, 'seeing another window asks first');
  require(labelled('Allow until it quits', dialog) && labelled('Allow once', dialog), 'the prompt offers to allow once or until it quits');
  await capture('look-prompt');
  click(labelled('Don’t allow', dialog));
  await eventually(() => !lookDialog(), 'Don’t allow closes the prompt');
  const denied = await refused;
  require(!denied.ok && denied.stderr.includes("didn't allow"), 'Don’t allow refuses the picture');

  const once = look('window', id, '-o', output('look-other'));
  await answer('Allow once', 'the prompt asks again');
  require((await once).ok, 'Allow once takes one picture');

  const typed = look('type', id, 'used');
  await answer('Allow until it quits', 'using another window asks separately');
  require((await typed).ok, 'Allow until it quits lets the program use the window');
  await eventually(() => other.get_title() === `${OTHER}: used`, 'typing reaches the allowed window');
  require((await look('window', id, '-o', output('look-other'))).ok && !lookDialog(), 'a lasting grant needs no new prompt');
  const screen = await look('screen', '-o', output('look-screen'));
  require(screen.ok && pngSize(screen.stdout)[0] === global.screen_width, 'screen saves the whole screen');

  const privacy = named('kestrel-privacy');
  await eventually(() => privacy.visible, 'the privacy button shows the grant');
  click(privacy);
  const menu = named('kestrel-context-menu');
  await eventually(() => menu.visible, 'the privacy menu opens');
  const grant = descendants(menu).find(actor => actor.mapped && actor.accessible_name?.endsWith('Using your windows'));
  require(grant, 'the privacy menu lists the program using windows');
  click(grant);
  await eventually(() => named('Stop access', menu), 'the grant offers to stop');
  click(named('Stop access', menu));
  await eventually(() => !privacy.visible, 'stopping access hides the privacy button');

  const asksAgain = look('window', id);
  await answer('Don’t allow', 'a stopped grant asks again');
  require(!(await asksAgain).ok, 'nothing is allowed after access stops');
}

async function checkPasswordPrompt() {
  const client = new KeyringClient();
  require(await client.ownSecretService(), 'the check stands in for the keyring');
  const id = handle();
  const pipe = new SecretPipe();
  const answered = client.password(id, {title: 'Unlock your Login keyring', body: 'A check is asking.'}, pipe);
  await openedDialog('a password prompt opens');
  const shot = await look('window', 'launched');
  const tap = await look('click', 'launched', '10', '10');
  require(!shot.ok && shot.stderr.includes(BUSY) && !tap.ok && tap.stderr.includes(BUSY), 'nothing can be seen or used while a password prompt is open');
  await client.close(id);
  await answered;
  await eventually(() => !keyringDialog(), 'the password prompt closes');
}

async function checkOldScreenshot() {
  const refused = await oldScreenshot(scratch('look-old-api.png'));
  require(!refused.ok && refused.stderr.includes(SCREENSHOT_REFUSAL), 'the old screenshot service points to luft-look');
}

export async function run() {
  const launched = await checkRun();
  try {
    await checkCapture(launched);
    await checkInput(launched);
    await checkPrompt();
    await checkPasswordPrompt();
    await checkOldScreenshot();
  } finally {
    stopProcess(launched.pid);
  }
  await eventually(() => !findWindow(window => window.get_title()?.startsWith(TARGET)), 'the launched program closes');
}
