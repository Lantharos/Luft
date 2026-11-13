import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {labelled} from '../../lib/actors.js';
import {appBinary} from '../../lib/apps/luftApp.js';
import {builtFixture, fixture, outcome, spawn, stop} from '../../lib/processes.js';
import {settled} from '../../lib/wait.js';
import {IN_SESSION} from '../lib/appImages.js';
import {answer, answers, DRIVE_LABEL, driveFolder, eventually, type Looked, Looker, mount, require, setAnswer, shownDialog,
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
  const script = `${own}/drive-looker.js`;
  Gio.File.new_for_path(builtFixture('clients', 'windows', 'driveLooker.js')).copy(Gio.File.new_for_path(script), Gio.FileCopyFlags.OVERWRITE, null, null);
  const open = (folder: string) => Looker.open(['flatpak', 'run', '--user', '--no-documents-portal', ID, script, folder], ID, {env});
  const watcher = spawn([appBinary('schelf'), '--watch-drives'], {env});
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
    await asking.close();
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
