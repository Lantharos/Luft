import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {labelled} from '../../lib/actors.js';
import {appBinary} from '../../lib/apps/luftApp.js';
import {builtFixture, fixture, outcome, spawn, stop, windows} from '../../lib/processes.js';
import {settled} from '../../lib/wait.js';
import {IN_SESSION} from '../lib/appImages.js';
import {answer, answers, DRIVE_LABEL, driveFolder, eventually, type Looked, Looker, mount, notificationTitled, require, setAnswer, shownDialog,
  unmount} from './drive.js';

const ID = 'org.example.Shelter';
const BUILDER = fixture('sandbox', 'shelter.sh');

function gnomeBranch(home: string) {
  const runtimes = Gio.File.new_for_path(`${home}/.local/share/flatpak/runtime/org.gnome.Platform/x86_64`);
  if (!runtimes.query_exists(null)) return null;
  return [...runtimes.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null)].map(info => info.get_name())[0] ?? null;
}

function overrides(home: string) {
  try {
    return new TextDecoder().decode(GLib.file_get_contents(`${home}/.local/share/flatpak/overrides/${ID}`)[1]);
  } catch {
    return '';
  }
}

async function lookOnceThere(looker: Looker): Promise<Looked> {
  let looked: Looked = {};
  await eventually(async () => !(looked = await looker.look()).error, 'the drive\'s stand-in shows up in the running Flatpak sandbox', 15000);
  return looked;
}

const OFFER = `Shelter can use ${DRIVE_LABEL}`;

/** Restarting from the notification closes the app as closing it would and opens it again from its menu entry. */
async function checkRestart(asking: Looker, point: string) {
  const offered = await eventually(() => notificationTitled(OFFER), 'Luft offers to restart the Flatpak app so it sees the drive');
  require(windows().includes(asking.window), 'the Flatpak app keeps running until you choose');
  const earlier = new Set(windows());
  const restart = require(offered.actions.find(action => action.label === 'Restart'), 'the offer has a Restart button');
  restart.activate();
  await eventually(() => !windows().includes(asking.window), 'restarting closes the Flatpak app', 25000);
  const reopened = await Looker.adopt(ID, earlier);
  require(reopened.window.get_sandboxed_app_id() === ID, `and opens it again in its sandbox, which shows the drive at ${point} once it's there`);
  await reopened.close();
}

/** An offer to restart goes away when the app is closed some other way. */
async function checkClosedElsewhere(open: (folder: string) => Promise<Looker>, point: string) {
  await setAnswer(ID, []);
  const asking = await open(point);
  await lookOnceThere(asking);
  await answer('Allow');
  await eventually(() => notificationTitled(OFFER), 'the offer to restart shows again after allowing again');
  await asking.close();
  await eventually(() => !notificationTitled(OFFER), 'and goes away once the app is closed some other way', 10000);
}

/** A Flatpak app that looks for a drive it wasn't given, with the watcher Luft runs for Flatpak sandboxes. */
export async function checkFlatpaks(home: string) {
  const branch = gnomeBranch(home);
  if (!branch) {
    console.log('Kestrel Drive access: Flatpak apps skipped without GNOME\'s runtime in KESTREL_FLATPAK_HOME');
    return;
  }
  require((await outcome(['bash', BUILDER, home, branch])).ok, 'a Flatpak app is built on GNOME\'s runtime');
  const env = {...IN_SESSION.env, HOME: home, XDG_DATA_HOME: `${home}/.local/share`, XDG_CONFIG_HOME: `${home}/.config`,
    XDG_CACHE_HOME: `${home}/.cache`, FLATPAK_USER_DIR: null, FLATPAK_SYSTEM_DIR: null};
  const own = `${home}/.var/app/${ID}`;
  GLib.mkdir_with_parents(own, 0o755);
  Gio.File.new_for_path(builtFixture('clients', 'windows', 'driveLooker.js'))
    .copy(Gio.File.new_for_path(`${own}/drive-looker.js`), Gio.FileCopyFlags.OVERWRITE, null, null);
  const open = (folder: string) => {
    GLib.file_set_contents(`${own}/folder`, folder);
    return Looker.open(['flatpak', 'run', '--user', '--no-documents-portal', ID], ID, {env});
  };
  const watcher = spawn([appBinary('schelf'), '--watch-drives'], {env: {...env, GSK_RENDERER: 'cairo'}});
  const folder = driveFolder(home);
  try {
    const point = await mount();
    const asking = await open(point);
    const before = await lookOnceThere(asking);
    require(before.names?.length === 0, 'before it may, the Flatpak app finds an empty folder where the drive is mounted');
    const dialog = await eventually(shownDialog, 'Kestrel asks whether the Flatpak app may use the drive', 15000);
    require(labelled(`Let ${ID} use ${DRIVE_LABEL}?`, dialog), 'the question names the Flatpak app by its sandbox, here without a menu entry by its ID');
    await answer('Allow');
    await eventually(async () => (await answers(ID))[0] === 'read-write', 'allowing gives the Flatpak app the drive');
    require(overrides(home).includes(`filesystems=${point};`), 'the Flatpak app\'s overrides open where the drive is mounted');
    await checkRestart(asking, point);
    await checkClosedElsewhere(open, point);
    await unmount();
    await eventually(() => !overrides(home).includes(point), 'once the drive is gone, its old place isn\'t opened to the app any more', 10000);
    await mount(folder);
    await eventually(() => overrides(home).includes(`filesystems=${folder};`), 'the drive mounted somewhere else is opened there', 10000);
    const looker = await open(folder);
    const after = await looker.look();
    const outside = Gio.File.new_for_path(folder).query_filesystem_info('filesystem::type', null).get_attribute_string('filesystem::type');
    require(after.names?.includes('saves.txt') && after.writable, 'once it may, the Flatpak app sees and changes what\'s on the drive');
    require(after.kind === outside && !after.kind?.startsWith('fuse'), `and reaches it as the drive itself (${after.kind}), not through FUSE`);
    await looker.close();
    await settled();
  } finally {
    await setAnswer(ID, []);
    await unmount().catch(() => null);
    await stop(watcher);
    await outcome(['rm', '-rf', GLib.path_get_dirname(folder)]);
  }
}
