import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {labelled} from '../../lib/actors.js';
import {builtFixture, outcome, scratch} from '../../lib/processes.js';
import {capture} from '../../lib/screenshots.js';
import {pause, settled} from '../../lib/wait.js';
import {withApp} from '../lib/apps.js';
import {IN_SESSION, install, launchLine, SABINE_BUILDER} from '../lib/appImages.js';
import type {Point} from '../../lib/input/input.js';
import {scrollToEnd, showEnd} from '../settings/navigation.js';
import {answer, answers, checkOnlySchelfAsks, DRIVE_LABEL, DRIVE_SIZE, driveFolder, eventually, Looker, mount, require, setAnswer,
  shownDialog, unmount} from './drive.js';

const QUIET = 3000;

function notificationTitled(text: string) {
  for (const source of Main.messageTray.getSources())
    for (const notification of source.notifications)
      if (notification.title?.includes(text)) return notification;
  return null;
}

async function sabineApp(name: string) {
  const image = scratch(`${name}.AppImage`);
  require((await outcome(['python3', SABINE_BUILDER, image, `org.example.${name}`, name, 'network = false\n'])).ok, `a Sabine AppImage called ${name} is built`);
  return install(image);
}

/** Opens the looker in the AppImage's sandbox, from its own folder, the one place there it can be read. */
function openLooker(id: string, folder: string) {
  const own = GLib.build_filenamev([GLib.get_home_dir(), '.var', 'app', id]);
  GLib.mkdir_with_parents(own, 0o755);
  const script = GLib.build_filenamev([own, 'drive-looker.js']);
  Gio.File.new_for_path(builtFixture('clients', 'windows', 'driveLooker.js')).copy(Gio.File.new_for_path(script), Gio.FileCopyFlags.OVERWRITE, null, null);
  const {program, rest} = launchLine(id);
  return Looker.open([program, ...rest, 'gjs', '-m', script, folder], id, IN_SESSION);
}

async function checkBackgroundLook(folder: string) {
  const id = await sabineApp('Tinker');
  const {program, rest} = launchLine(id);
  const looked = outcome([program, ...rest, 'sh', '-c', `ls ${GLib.shell_quote(folder)}; sleep 4`], IN_SESSION);
  await pause(QUIET);
  require(!shownDialog(), 'an app that looks for the drive while you use another one isn\'t asked about');
  await looked;
  return id;
}

async function checkAsked(id: string, folder: string) {
  const looker = await openLooker(id, folder);
  const before = await looker.look();
  require(before.names?.length === 0, 'before it may, the app finds an empty folder where the drive is mounted');
  const dialog = await eventually(shownDialog, 'Kestrel asks whether the app may use the drive', 15000);
  require(labelled(`Let Harvest use ${DRIVE_LABEL}?`, dialog), 'the question names the app by its sandbox and the drive by its label');
  require(labelled(`It’s a ${DRIVE_SIZE} drive. Harvest can read and change everything on it, from the next time it opens.`, dialog),
    'and says how big the drive is and what the app could do');
  await checkOnlySchelfAsks();
  await settled();
  await capture('drive-access-dark');
  await answer('Allow');
  await eventually(async () => (await answers(id))[0] === 'read-write', 'allowing gives the app the drive to read and change');
  const offered = await eventually(() => notificationTitled(`Harvest can use ${DRIVE_LABEL}`), 'Luft offers to restart the app so it sees the drive');
  offered.destroy();
  await looker.close();
}

const HARVEST_ROW: Point = [660, 589];

async function captureGiven(id: string) {
  await withApp('schelf', [`schelf:app?${id}`], async app => (await scrollToEnd(app, await app.settle(() => true))).save('schelf-drives'));
  await withApp('settings', [], async app => {
    const shown = await showEnd(app, 'apps');
    app.click(HARVEST_ROW);
    (await app.settle(frame => !frame.looksLike(shown))).save('settings-apps-drives');
  });
}

async function checkOthersStayOut(other: string, folder: string) {
  const {program, rest} = launchLine(other);
  const listed = await outcome([program, ...rest, 'ls', '-A', folder], IN_SESSION);
  require(!listed.stdout.includes('saves.txt'), 'another app still doesn\'t see a drive one app was given');
}

async function checkGiven(id: string, other: string, folder: string) {
  await captureGiven(id);
  await checkOthersStayOut(other, folder);
  const looker = await openLooker(id, folder);
  const after = await looker.look();
  const outside = Gio.File.new_for_path(folder).query_filesystem_info('filesystem::type', null).get_attribute_string('filesystem::type');
  require(after.names?.includes('saves.txt'), 'once it may, the app sees what\'s on the drive');
  require(after.kind === outside && !after.kind?.startsWith('fuse'), `and reaches it as the drive itself (${after.kind}), not through FUSE`);
  require(after.writable, 'and can change it');
  await looker.close();
  await setAnswer(id, ['read-only']);
  const reading = await openLooker(id, folder);
  const read = await reading.look();
  require(read.names?.includes('saves.txt') && !read.writable, 'an app given the drive to read sees it but can\'t change it');
  await reading.close();
}

async function checkRefused(id: string, folder: string) {
  await setAnswer(id, []);
  require((await answers(id)).length === 0, 'taking the drive away keeps nothing of it for the app');
  const asking = await openLooker(id, folder);
  await asking.look();
  await answer('Don’t allow');
  await eventually(async () => (await answers(id))[0] === 'no', 'not allowing it is remembered');
  await asking.close();
  const again = await openLooker(id, folder);
  const looked = await again.look();
  await pause(QUIET);
  require(!shownDialog() && !looked.names?.includes('saves.txt'), 'an app that was told no is never asked again and doesn\'t see the drive');
  await again.close();
}

/** An AppImage that looks for a drive it wasn't given, in Luft's own sandbox. */
export async function checkAppImages() {
  const folder = driveFolder();
  await mount(folder);
  const id = await sabineApp('Harvest');
  try {
    const other = await checkBackgroundLook(folder);
    await checkAsked(id, folder);
    await checkGiven(id, other, folder);
    await checkRefused(id, folder);
  } finally {
    await setAnswer(id, []);
    await unmount();
    await outcome(['rm', '-rf', GLib.path_get_dirname(folder)]);
  }
}
