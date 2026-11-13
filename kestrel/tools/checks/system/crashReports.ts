import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type St from 'gi://St';

import {StandInPultInbox} from '../../fixtures/services/pultInbox.js';
import {labelled, styled, textOf} from '../lib/actors.js';
import {freePorts} from '../lib/apps/ports.js';
import {checks} from '../lib/check.js';
import {click, press} from '../lib/input/input.js';
import {launchDetached} from '../lib/apps/luftApp.js';
import {scratch, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {forgetCrashes} from '../extensions/lib/extensions.js';
import {pause, settled} from '../lib/wait.js';
import {
  askDialog, choose, collected, contentsDialog, crash, cursor, dumped, FIXTURE, forbidden, poke, removeConfig,
  reportsProperty, scratchCopy, setMetered, shownJson, titled, writeConfig,
} from './lib/crashReports.js';

const {require, eventually} = checks('crash reports');
const STATE = scratch('crash-reports.json');
const REQUEUED = `0000~${GLib.getenv('KESTREL_CAPTURE_WORKER')}-system:crashReports`;
const ASKED_WITHIN = 30000;
const QUIET_FOR = 2500;
const METERED = 1;
const NOT_METERED = 4;
const SHELL_ERROR = 'the crash reports check broke the shell';

interface Body {
  data: Record<string, unknown> & {program: string; kind: string; signal?: string; message?: string; script?: string[]};
}

async function asked(label: string) {
  return eventually(askDialog, label, ASKED_WITHIN);
}

/** Opens What's in it, checks it says nothing it mustn't, and gives back what it shows. */
async function contents(name: string): Promise<{shown: string; body: Body}> {
  click(require(labelled('What’s in it', askDialog()!), 'the question offers to show the report'));
  await eventually(contentsDialog, 'the report opens');
  await settled();
  await capture(name);
  const shown = shownJson();
  require(forbidden(shown).length === 0, `the report shows nothing that says who sent it (found ${forbidden(shown).join(', ')})`);
  click(require(labelled('Close', contentsDialog()!), 'the report can be closed'));
  await eventually(() => !contentsDialog(), 'the report closes');
  return {shown, body: JSON.parse(shown) as Body};
}

function checkPost(inbox: StandInPultInbox, shown: string) {
  const post = inbox.posts.at(-1)!;
  require(post.problems.length === 0, `the inbox takes the post as its schema says (${post.problems.join('; ')})`);
  require(forbidden(post.raw).length === 0, `the post holds nothing that says who sent it (found ${forbidden(post.raw).join(', ')})`);
  require(JSON.stringify(JSON.parse(post.raw)) === JSON.stringify(JSON.parse(shown)), 'what is sent is exactly what the report showed');
}

async function quietly(before: number, inbox: StandInPultInbox, label: string) {
  await pause(QUIET_FOR);
  require(!askDialog() && inbox.posts.length === before && await reportsProperty<string>('Waiting') === '', label);
}

async function startWithOldCrashesForgotten(inbox: StandInPultInbox) {
  writeConfig(inbox.port);
  require(await reportsProperty<boolean>('Available'), 'the crash reports service has an inbox');
  await choose('never');
  await collected('');
  await pause(QUIET_FOR);
  await choose('ask');
}

async function signals(inbox: StandInPultInbox) {
  let before = cursor();
  GLib.mkdir_with_parents(GLib.path_get_dirname(scratchCopy()), 0o755);
  Gio.File.new_for_path(FIXTURE).copy(Gio.File.new_for_path(scratchCopy()), Gio.FileCopyFlags.OVERWRITE, null, null);
  await dumped(await crash('segv', scratchCopy()));
  await collected(before);
  await quietly(0, inbox, 'a program that isn’t Luft’s crashing asks nothing and sends nothing');

  before = cursor();
  await dumped(await crash('segv'));
  await collected(before);
  await asked('Luft’s own program crashing asks whether to send a report');
  require(titled('A part of Luft closed unexpectedly'), 'a part of Luft without a name of its own is called that');
  await capture('crash-reports-fallback');
  const {shown, body} = await contents('crash-reports-contents');
  require(body.data.program === 'luft-crash-fixture' && body.data.kind === 'signal' && body.data.signal === 'SIGSEGV',
    'the report names the program and the signal it crashed on');
  click(require(labelled('Send', askDialog()!), 'the question offers to send'));
  await eventually(() => inbox.posts.length === 1, 'sending posts the report to the inbox');
  checkPost(inbox, shown);

  before = cursor();
  await dumped(await crash('segv'));
  await collected(before);
  await quietly(1, inbox, 'the same crash again asks nothing');
}

const APP_SIGNALS = ['SEGV', 'ABRT', 'QUIT'];
/** Sabine apps catch some signals for themselves, so this tries the next one until the app dumps core. */
async function crashApp(pid: number) {
  for (const signal of APP_SIGNALS) {
    Gio.Subprocess.new(['kill', `-${signal}`, String(pid)], Gio.SubprocessFlags.NONE);
    try {
      await dumped(pid, 10);
      return;
    } catch {
      continue;
    }
  }
  throw new Error(`Rover never dumped core on ${APP_SIGNALS.join(', ')}`);
}

async function appCrash(inbox: StandInPultInbox) {
  const rover = launchDetached('rover', scratch('crash-reports-rover.log'));
  await waitForWindow(window => window.get_pid() === rover || window.get_wm_class() === 'com.lantharos.rover', 'Rover opens');
  const before = cursor();
  await crashApp(rover);
  await collected(before);
  await asked('one of Luft’s apps crashing asks right away');
  require(titled('Rover closed unexpectedly'), 'the question names the app that closed');
  await settled();
  await capture('crash-reports-app');
  click(require(labelled('Don’t send', askDialog()!), 'the question offers not to send'));
  await quietly(inbox.posts.length, inbox, 'not sending the app’s report sends nothing');
}

async function panic(inbox: StandInPultInbox) {
  const before = cursor();
  await crash('panic');
  await collected(before);
  await asked('a panic in one of Luft’s services asks right away');
  const {body} = await contents('crash-reports-panic');
  require(body.data.kind === 'panic' && body.data.message?.includes('panicked as asked') === true, 'the report says what the panic said');
  click(require(styled('check-box', askDialog()!)[0], 'the question offers to remember the answer'));
  press(Clutter.KEY_Escape);
  await quietly(1, inbox, 'Escape sends nothing');
  require(await reportsProperty<string>('Choice') === 'ask', 'Escape leaves the choice alone, even with the box ticked');
}

async function choices(inbox: StandInPultInbox) {
  let before = cursor();
  await dumped(await crash('abort'));
  await collected(before);
  await asked('another crash asks');
  const remember = require(styled('check-box', askDialog()!)[0], 'the question offers to remember the answer') as St.Button;
  require(textOf(remember.get_label_actor()) === 'Do the same next time without asking', 'the box says what it remembers');
  click(remember);
  await eventually(() => remember.checked, 'ticking the box remembers the answer');
  click(require(labelled('Send', askDialog()!), 'the question offers to send'));
  await eventually(() => inbox.taken.length === 2, 'sending with the answer remembered posts the report');
  require(await reportsProperty<string>('Choice') === 'always', 'the answer is remembered as always send');

  before = cursor();
  await dumped(await crash('ill'));
  await collected(before);
  await eventually(() => inbox.taken.length === 3, 'with always send, the next crash is sent');
  require(!askDialog(), 'with always send, nothing asks');

  await setMetered(METERED);
  before = cursor();
  await dumped(await crash('fpe'));
  await collected(before);
  await pause(QUIET_FOR);
  require(inbox.posts.length === 3 && await reportsProperty<number>('Queued') === 1, 'on a metered connection the report waits');
  inbox.answerWith(429, 2);
  await setMetered(NOT_METERED);
  await eventually(() => inbox.posts.at(-1)?.status === 429, 'off the metered connection the report is sent');
  require(await reportsProperty<number>('Queued') === 1, 'a report Pult turns away for now stays queued');
  inbox.answerWith(204);
  await eventually(() => inbox.taken.some(crashed => crashed.signal === 'SIGFPE'), 'the report goes once Pult says to try again', 20000);
  await eventually(async () => await reportsProperty<number>('Queued') === 0, 'nothing is left in the queue');

  await choose('never');
  before = cursor();
  await crash('panic-other');
  await collected(before);
  await quietly(inbox.posts.length, inbox, 'with never send, a crash asks nothing and sends nothing');
}

async function breakTheShell(port: number) {
  await choose('ask');
  GLib.file_set_contents(STATE, JSON.stringify({port}));
  GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
    throw new Error(SHELL_ERROR);
  });
  await pause(500);
  GLib.file_set_contents(GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_QUEUE')!, REQUEUED]), '');
  const shell = Gio.Credentials.new().get_unix_pid();
  Gio.Subprocess.new(['sh', '-c', `kill -SEGV ${shell}; sleep 1; kill -SEGV ${shell}`], Gio.SubprocessFlags.NONE);
  await new Promise(() => {});
}

async function afterTheShellCrashed({port}: {port: number}) {
  const inbox = new StandInPultInbox(port);
  try {
    await eventually(async () => {
      await poke();
      return askDialog();
    }, 'the desktop crashing asks once it is back', 60000);
    require(titled('The desktop closed unexpectedly'), 'the question says the desktop closed');
    const {shown, body} = await contents('crash-reports-script');
    require(body.data.program === 'kestrel' && body.data.kind === 'script' && body.data.message?.includes(SHELL_ERROR) === true,
      'the report says which uncaught error came before the crash');
    require((body.data.script ?? []).length > 0, 'the report has the script’s stack');
    click(require(labelled('Send', askDialog()!), 'the question offers to send'));
    await eventually(() => inbox.posts.length > 0, 'the shell’s report is sent');
    checkPost(inbox, shown);
    require(inbox.taken.some(crashed => crashed.kind === 'script'), 'the inbox takes the shell’s report');
  } finally {
    inbox.close();
    removeConfig();
    GLib.unlink(STATE);
    forgetCrashes();
  }
}

export async function run() {
  if (GLib.file_test(STATE, GLib.FileTest.EXISTS)) {
    await afterTheShellCrashed(JSON.parse(new TextDecoder().decode(GLib.file_get_contents(STATE)[1])) as {port: number});
    return;
  }
  const {pult} = freePorts('pult');
  const inbox = new StandInPultInbox(pult);
  try {
    await startWithOldCrashesForgotten(inbox);
    await signals(inbox);
    await appCrash(inbox);
    await panic(inbox);
    await choices(inbox);
  } catch (error) {
    inbox.close();
    removeConfig();
    throw error;
  }
  inbox.close();
  await breakTheShell(pult);
}

export const timeout = 300000;
