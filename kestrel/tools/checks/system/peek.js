import GLib from 'gi://GLib';

import {descendants, labelled, named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click} from '../lib/input.js';
import {findWindow, gjs, scratch, waitForWindow} from '../lib/processes.js';
import {capture, output} from '../lib/screenshots.js';
import {settled, waitUntil} from '../lib/wait.js';
import {KeyringClient, SecretPipe, handle as promptHandle, keyringDialog, openedDialog} from '../keyring/lib/client.js';
import {
  HANDLE, displayLeftovers, endProgram, oldScreenshot, peek, peekDialog, pngSize, runTarget, scopeActive, titleOf, windowsOf,
} from './lib/peek.js';

const {require, eventually} = checks('peek');
const HIDDEN = 'Peek hidden';
const SECOND = 'Peek second';
const HERE = 'Peek here';
const OTHER = 'Peek other';
const BUSY = 'The screen is locked, or a system prompt is open on it';
const SCREENSHOT_REFUSAL = 'Screenshots are limited to the system. To see or use windows, run peek --help';
const READY_WITHIN = 5000;

const started = new Set();
const titled = title => window => window.get_title() === title;
const logFor = title => GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_DIR'), `${title}.log`]);
const at = (window, x, y) => [String(Math.round(window.width * x)), String(Math.round(window.height * y))];

async function answer(button, label) {
  const dialog = await waitUntil(peekDialog, label);
  await settled();
  click(labelled(button, dialog));
  await eventually(() => !peekDialog(), `${button} closes the prompt`);
}

async function startHidden(title) {
  const begun = GLib.get_monotonic_time();
  const run = await runTarget(title, '--wait-window', '--log', logFor(title));
  const seconds = (GLib.get_monotonic_time() - begun) / 1e6;
  if (HANDLE.test(run.stdout)) started.add(run.stdout);
  require(run.ok && HANDLE.test(run.stdout), `peek run prints only a handle (${run.stderr})`);
  console.log(`peek run with --wait-window took ${seconds.toFixed(2)} s`);
  require(seconds * 1000 < READY_WITHIN, 'a hidden display is ready quickly');
  return run.stdout;
}

async function checkHidden() {
  const focus = global.display.focus_window;
  const [pointerX, pointerY] = global.get_pointer();
  const first = await startHidden(HIDDEN);
  require(!findWindow(window => window.get_title()?.startsWith(HIDDEN)), 'the program does not open on the screen');
  const [window] = await windowsOf(first);
  require(window?.title === HIDDEN && window.access === 'use' && window.handle === first, 'list shows the program behind its handle');

  const shot = await peek('window', first, '-o', output('peek-hidden'));
  const [width, height] = pngSize(output('peek-hidden'));
  require(shot.ok && width === window.width && height === window.height, 'window saves a picture of the hidden window');

  require((await peek('click', first, ...at(window, 0.5, 0.5))).ok, 'click reaches the hidden window');
  await eventually(async () => await titleOf(first) === `${HIDDEN}: pressed 1`, 'the click presses the button');
  require((await peek('click', first, ...at(window, 0.5, 0.25))).ok && (await peek('type', first, 'hidden text')).ok, 'type reaches the field');
  await eventually(async () => await titleOf(first) === `${HIDDEN}: hidden text`, 'the typed text lands in the field');
  require((await peek('key', first, 'ctrl+a')).ok && (await peek('type', first, 'swapped')).ok, 'key sends a combination');
  await eventually(async () => await titleOf(first) === `${HIDDEN}: swapped`, 'ctrl+a selects the text so typing replaces it');

  require((await peek('click', first, ...at(window, 0.5, 0.8))).ok, 'click opens the menu');
  await eventually(async () => (await windowsOf(first))[0].height > window.height, 'the picture grows to include the open menu');
  const menu = await peek('window', first, '-o', output('peek-menu'));
  const [, menuHeight] = pngSize(output('peek-menu'));
  require(menu.ok && menuHeight > height, 'window pictures include open menus');
  await peek('key', first, 'escape');

  const second = await startHidden(SECOND);
  require(second !== first, 'every launch gets its own handle');
  require((await peek('click', second, ...at(window, 0.5, 0.25))).ok && (await peek('type', second, 'two')).ok, 'the second display takes input');
  await eventually(async () => await titleOf(second) === `${SECOND}: two`, 'input reaches the second program');
  require(await titleOf(first) === `${HIDDEN}: swapped` && (await windowsOf(second)).length === 1, 'launches stay independent');

  const [pointerAfterX, pointerAfterY] = global.get_pointer();
  require(global.display.focus_window === focus && pointerAfterX === pointerX && pointerAfterY === pointerY,
    'the screen keeps its focus and pointer throughout');

  require((await peek('stop', second)).ok, 'stop closes a hidden display');
  await eventually(async () => !await scopeActive(second) && !displayLeftovers(second).length, 'nothing of a stopped display is left', 10000);
  await endProgram(first);
  await eventually(async () => !await scopeActive(first) && !displayLeftovers(first).length, 'a display closes with its program', 10000);
  const gone = await peek('window', first);
  require(!gone.ok, 'a closed display\'s handle stops working');
}

async function checkHere() {
  const run = await runTarget(HERE, '--here', '--wait-window', '--log', logFor(HERE));
  require(run.ok && HANDLE.test(run.stdout), `run --here prints a handle (${run.stderr})`);
  const here = run.stdout;
  started.add(here);
  const window = await waitForWindow(titled(HERE));
  const [entry] = await windowsOf(here);
  require(entry.id === window.get_id() && entry.access === 'use', 'run --here opens the program on the screen, usable without asking');
  require((await peek('window', here, '-o', output('peek-here'))).ok, 'window captures a --here window');
  require((await peek('click', here, ...at(entry, 0.5, 0.25))).ok && (await peek('type', here, 'on screen')).ok, 'input reaches a --here window');
  await eventually(() => window.get_title() === `${HERE}: on screen`, 'typing reaches the --here window');
  const outside = await peek('click', here, String(entry.width + 10), '10');
  require(!outside.ok && outside.stderr.includes('outside the window'), 'points outside the window are refused');
  return here;
}

async function checkPrompt() {
  gjs('clients/peekTarget.js', [OTHER]);
  const other = await waitForWindow(titled(OTHER));
  const id = String(other.get_id());
  const listed = JSON.parse((await peek('list', '--json')).stdout).find(candidate => candidate.id === other.get_id());
  require(listed?.access === 'ask' && listed.title === '', 'other windows hide their title until they may be seen');

  const once = peek('window', id, '-o', output('peek-other'));
  await answer('Allow once', 'seeing another window asks first');
  await capture('peek-prompt-answered');
  require((await once).ok, 'Allow once takes one picture');

  const typed = peek('type', id, 'used');
  await answer('Allow until it quits', 'using another window asks separately');
  require((await typed).ok, 'Allow until it quits lets the program use the window');
  await eventually(() => other.get_title() === `${OTHER}: used`, 'typing reaches the allowed window');
  require((await peek('window', id)).ok && !peekDialog(), 'a lasting grant needs no new prompt');
  const screen = await peek('screen', '-o', output('peek-screen'));
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

  const refused = peek('window', id);
  const dialog = await waitUntil(peekDialog, 'a stopped grant asks again');
  await settled();
  await capture('peek-prompt');
  click(labelled('Don’t allow', dialog));
  const denied = await refused;
  require(!denied.ok && denied.stderr.includes("didn't allow"), 'Don’t allow refuses the picture');
  await eventually(() => !peekDialog(), 'Don’t allow closes the prompt');
  const again = await peek('window', id);
  require(!again.ok && again.stderr.includes('declined') && !peekDialog(), 'a declined program is refused without asking again');
}

async function checkPasswordPrompt(here) {
  const client = new KeyringClient();
  require(await client.ownSecretService(), 'the check stands in for the keyring');
  const id = promptHandle();
  const answered = client.password(id, {title: 'Unlock your Login keyring', body: 'A check is asking.'}, new SecretPipe());
  await openedDialog('a password prompt opens');
  const shot = await peek('window', here);
  const tap = await peek('click', here, '10', '10');
  require(!shot.ok && shot.stderr.includes(BUSY) && !tap.ok && tap.stderr.includes(BUSY), 'nothing can be seen or used while a password prompt is open');
  await client.close(id);
  await answered;
  await eventually(() => !keyringDialog(), 'the password prompt closes');
}

async function checkOldScreenshot() {
  const refused = await oldScreenshot(scratch('peek-old-api.png'));
  require(!refused.ok && refused.stderr.includes(SCREENSHOT_REFUSAL), 'the old screenshot service points to peek');
}

async function stopStarted() {
  for (const handle of started) await peek('stop', handle);
}

export async function run() {
  try {
    await checkHidden();
    const here = await checkHere();
    await checkPrompt();
    await checkPasswordPrompt(here);
    await checkOldScreenshot();
    require((await peek('stop', here)).ok, 'stop closes a --here program');
    await eventually(() => !findWindow(window => window.get_title()?.startsWith(HERE)), 'the --here window goes away');
  } finally {
    await stopStarted();
  }
}
