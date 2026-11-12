import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

import {withApp} from '../apps/lib/apps.js';
import {write} from '../apps/lib/files.js';
import {answerable, descendants, labelled, shownStyled, textOf} from '../lib/actors.js';
import {appBinary} from '../lib/apps/luftApp.js';
import {checks} from '../lib/check.js';
import {click} from '../lib/input/input.js';
import {repository, scratch, spawn} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled, waitUntil} from '../lib/wait.js';
import {takeCalls} from './lib/systemCalls.js';

const {require, eventually} = checks('changes');
const LUFT = repository('target', 'release', 'luft');
const DIALOG = 'kestrel-changes-dialog';
const DECLINE = 'Don’t change';
const APPROVE = 'Change';
const DECLINED = 4;
const UNAVAILABLE = 5;
const NO_DIALOG_FOR = 1500;
const SCROLLBAR_GAP = 4;
const APP_CACHE_REFRESH = 3000;
const ISOLATION = /[\u2068\u2069]/g;
const DEVELOPER_TOOLS = 'Security · Developer tools';
const USB = 'Security · Hold back new USB devices';
const DEVELOPER_WARNING = 'Programs you run can then see your screen';
const USB_WARNING = 'such as a device that pretends to be a keyboard';
const MANY = ['appearance.style=dark', 'appearance.pure-black=on', 'taskbar.size=large', 'taskbar.look=solid', 'taskbar.shape=floating', 'keyboard.repeat-delay=400',
  'clock.seconds=on', 'clock.weekday=on', 'accessibility.high-contrast=on', 'security.developer-tools=on', 'security.usb-protection=off', 'updates.look=weekly'];

interface Ran {
  status: number;
  stdout: string;
  stderr: string;
}

function luft(args: string[], program = LUFT): Promise<Ran> {
  const process = spawn([program, '--json', ...args], {flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE});
  return new Promise((resolve, reject) => process.communicate_utf8_async(null, null, (_process, result) => {
    try {
      const [, stdout, stderr] = process.communicate_utf8_finish(result);
      resolve({status: process.get_exit_status(), stdout: stdout.trim(), stderr: stderr.trim()});
    } catch (error) {
      reject(error);
    }
  }));
}

const says = (text: string, root: Clutter.Actor) =>
  descendants(root).some(actor => actor.mapped && (textOf(actor) ?? '').replace(ISOLATION, '').includes(text));

function rowOf(text: string, root: Clutter.Actor): Clutter.Actor {
  const label = descendants(root).find(actor => (textOf(actor) ?? '').replace(ISOLATION, '') === text);
  let row = label ?? null;
  while (row && !(row instanceof St.Widget && row.has_style_class_name('kestrel-portal-row'))) row = row.get_parent();
  require(!!row, `the review has a row for ${text}`);
  return row!;
}

const scrollOf = (dialog: Clutter.Actor) => descendants(dialog).find(actor => actor instanceof St.ScrollView) as St.ScrollView;
const left = (actor: Clutter.Actor) => actor.get_transformed_position()[0];
const right = (actor: Clutter.Actor) => left(actor) + actor.get_transformed_size()[0];

function checkGutter(dialog: Clutter.Actor, row: Clutter.Actor, scrolls: boolean) {
  const scroll = scrollOf(dialog);
  if (scrolls) {
    const thumb = descendants(scroll).find(actor => actor instanceof St.Widget && actor.has_style_class_name('vhandle'))!;
    require(scroll.vscrollbar_visible && thumb.mapped && right(row) + SCROLLBAR_GAP <= left(thumb), 'the scrollbar thumb sits beside the rows, not over them');
  } else {
    require(!scroll.vscrollbar_visible && Math.abs(right(row) - right(scroll)) < 1, 'a list that fits has no scrollbar and no gutter');
  }
}

const exitOf = (path: string) => GLib.file_test(path, GLib.FileTest.EXISTS) ? new TextDecoder().decode(GLib.file_get_contents(path)[1]).trim() : null;

const desktop = () => new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
const kestrel = () => new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const review = () => answerable(DIALOG);
const applied = () => takeCalls().filter(call => call.startsWith('Changes1.Apply'));

async function answer(button: string, label: string) {
  const dialog = await waitUntil(review, label);
  await settled();
  click(labelled(button, dialog)!);
  await eventually(() => !shownStyled(DIALOG), `${button} closes the review`);
}

async function checkOneReviewForTheWholeSet() {
  takeCalls();
  const asking = luft(['set', 'appearance.style=dark', 'taskbar.size=large', 'security.developer-tools=on', 'security.usb-protection=off']);
  const dialog = await waitUntil(review, 'a set with a system setting opens one review');
  await settled();
  await capture('changes-review');
  for (const text of ['Change these 4 settings?', 'wants to change these settings.', 'Appearance · Style', 'Light → Dark', 'Taskbar and Start · Size', 'Medium → Large', 'administrator'])
    require(says(text, dialog), `the review shows ${text}`);
  require(!says('luft', dialog), 'the review names who asked, not luft');
  const developer = rowOf(DEVELOPER_TOOLS, dialog);
  checkGutter(dialog, developer, true);
  const usb = rowOf(USB, dialog);
  require(says('Off → On', developer) && says(DEVELOPER_WARNING, developer) && !says(USB_WARNING, developer), 'Developer tools keeps its own warning in its row');
  require(says('On → Off', usb) && says(USB_WARNING, usb) && !says(DEVELOPER_WARNING, usb), 'USB protection keeps its own warning in its row');
  await answer(DECLINE, 'the review waits for an answer');
  const declined = await asking;
  require(declined.status === DECLINED, `luft says the changes were declined (${declined.status}: ${declined.stderr})`);
  require(desktop().get_string('color-scheme') !== 'prefer-dark' && kestrel().get_string('taskbar-size') === 'normal', 'declining changes none of the settings');
  require(applied().length === 0, 'declining hands nothing to the system service');

  const approving = luft(['set', 'appearance.style=dark', 'taskbar.size=large', 'security.developer-tools=on', 'security.usb-protection=off']);
  await answer(APPROVE, 'the same set opens the review again');
  const approved = await approving;
  require(approved.status === 0, `approving applies the set (${approved.stderr})`);
  require(desktop().get_string('color-scheme') === 'prefer-dark' && kestrel().get_string('taskbar-size') === 'large', 'approving makes the personal changes');
  require(applied().join() === 'Changes1.Apply developer-tools true,Changes1.Apply usb-protection false', 'the system service gets exactly the reviewed system changes');
  const result = JSON.parse(approved.stdout) as {reviewed: boolean; changes: {setting: string}[]};
  require(result.reviewed && result.changes.length === 4, 'luft lists every change it made after review');
}

async function checkUndoAsksAgain() {
  const undoing = luft(['undo']);
  const dialog = await waitUntil(review, 'putting back a system setting asks again');
  require(says('On → Off', rowOf(DEVELOPER_TOOLS, dialog)) && says('Off → On', rowOf(USB, dialog)), 'the review shows the settings going back');
  await answer(APPROVE, 'the undo review waits');
  require((await undoing).status === 0, 'undo puts the set back once approved');
  require(desktop().get_string('color-scheme') !== 'prefer-dark' && kestrel().get_string('taskbar-size') === 'normal', 'undo puts the personal settings back');
  require(applied().join() === 'Changes1.Apply developer-tools false,Changes1.Apply usb-protection true', 'undo hands the system service the values from before');
}

async function checkPersonalChangesApplyDirectly() {
  const direct = await luft(['set', 'taskbar.size=large']);
  require(direct.status === 0 && !shownStyled(DIALOG), 'a set of settings any program may change applies without a review');
  require(kestrel().get_string('taskbar-size') === 'large', 'the change is made');
  require((await luft(['undo'])).status === 0 && kestrel().get_user_value('taskbar-size') === null, 'undo gives the key its default back');
}

async function checkOnlyLuftGetsAReview() {
  const copy = scratch('changes', 'luft');
  GLib.mkdir_with_parents(GLib.path_get_dirname(copy), 0o755);
  Gio.File.new_for_path(LUFT).copy(Gio.File.new_for_path(copy), Gio.FileCopyFlags.OVERWRITE, null, null);
  const impostor = luft(['set', 'security.developer-tools=on'], copy);
  await pause(NO_DIALOG_FOR);
  require(!shownStyled(DIALOG), 'a copy of luft outside the system gets no review');
  const refused = await impostor;
  require(refused.status === UNAVAILABLE && refused.stderr.includes('Only luft from the system image'), `the copy is told why (${refused.stderr})`);
  require(applied().length === 0, 'the copy changes nothing');
}

async function installTernAsOnLuft() {
  const entry = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications', 'com.lantharos.tern.desktop']);
  write(entry, `[Desktop Entry]\nType=Application\nName=Tern\nExec=${appBinary('tern')} %U\nStartupWMClass=com.lantharos.tern\n`);
  await eventually(() => Shell.AppSystem.get_default().lookup_app('com.lantharos.tern.desktop')?.get_app_info().get_filename()?.startsWith(GLib.get_user_data_dir()),
    'Kestrel knows Tern by its program, as on Luft', APP_CACHE_REFRESH);
  return () => GLib.unlink(entry);
}

async function checkOneReviewAtATime() {
  const exit = scratch('changes', 'tern-exit');
  GLib.mkdir_with_parents(GLib.path_get_dirname(exit), 0o755);
  const uninstall = await installTernAsOnLuft();
  try {
    await reviewFromTern(exit);
  } finally {
    uninstall();
  }
}

async function reviewFromTern(exit: string) {
  await withApp('tern', ['-e', 'sh', '-c', `'${LUFT}' set security.usb-protection=off; echo $? > '${exit}'; sleep 60`], async () => {
    const dialog = await waitUntil(review, 'luft run in Tern opens a review');
    await settled();
    await capture('changes-review-short');
    require(says('Tern wants to change this setting.', dialog), 'the review names the terminal luft runs in');
    checkGutter(dialog, rowOf(USB, dialog), false);
    const second = await luft(['set', 'updates.channel=stable']);
    require(second.status === UNAVAILABLE && second.stderr.includes('waiting for review'), 'a second set waits until the first is answered');
    await answer(DECLINE, 'the first review is still open');
    await eventually(() => exitOf(exit) === `${DECLINED}`, 'the first set was declined');
  });
}

async function checkManyChangesFitTheScreen() {
  const asking = luft(['set', ...MANY]);
  const dialog = await waitUntil(review, 'a long set opens one review');
  await settled();
  await capture('changes-review-long');
  const [, y] = dialog.get_transformed_position();
  const [, height] = dialog.get_transformed_size();
  require(y >= 0 && y + height <= global.stage.height, 'the review stays within the screen');
  for (const button of [DECLINE, APPROVE]) {
    const shown = labelled(button, dialog)!;
    const [, top] = shown.get_transformed_position();
    require(shown.mapped && top + shown.height <= global.stage.height, `${button} stays on the screen`);
  }
  checkGutter(dialog, rowOf(DEVELOPER_TOOLS, dialog), true);
  await answer(DECLINE, 'the long review waits');
  require((await asking).status === DECLINED, 'the long set was declined');
}

async function checkInvalidSetsNeverShow() {
  const invalid = await luft(['set', 'appearance.style=dark', 'updates.channel=beta']);
  require(invalid.status === 3 && !shownStyled(DIALOG), 'a set with one wrong value is refused whole before any review');
}

export async function run() {
  const scheme = desktop().get_string('color-scheme');
  const schedule = kestrel().get_string('dark-schedule');
  try {
    require((await luft(['set', 'appearance.style=light'])).status === 0, 'the check starts from the light style');
    await checkPersonalChangesApplyDirectly();
    await checkInvalidSetsNeverShow();
    await checkOneReviewForTheWholeSet();
    await checkUndoAsksAgain();
    await checkOneReviewAtATime();
    await checkManyChangesFitTheScreen();
    await checkOnlyLuftGetsAReview();
  } finally {
    desktop().set_string('color-scheme', scheme);
    kestrel().set_string('dark-schedule', schedule);
    Gio.Settings.sync();
  }
}
