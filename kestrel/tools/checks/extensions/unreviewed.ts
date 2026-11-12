import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {pause} from '../lib/wait.js';
import {listed, ownFolder, removeFolder, request} from './lib/extensions.js';
import {installOwn} from './lib/sandbox.js';
import {allowFolder, installCopy, packagesCalls, refused, removeUnreviewed, setDeveloperTools, unreviewedFolder} from './lib/unreviewed.js';

const {require, eventually} = checks('extensions');
const ID = 'com.example.Unreviewed';

const markers = () => (globalThis as {markers?: string[]}).markers ?? [];

function edit(mark: string) {
  GLib.file_set_contents(GLib.build_filenamev([ownFolder(ID), 'extension.js']),
    `export default function enable() {\n  (globalThis.markers ??= []).push('${ID}:${mark}');\n}\n`);
}

async function reaches(origin: string, state: string, label: string) {
  await request('Reload', ID);
  return eventually(async () => {
    const found = await listed(ID);
    return found?.origin === origin && found.state === state ? found : null;
  }, label, 20000);
}

async function checkSandboxedFirst() {
  installOwn('marker', ID, text => `${text}permissions = ["wallpaper"]\n`);
  edit('folder-1');
  await reaches('own', 'store-only', 'an extension in the account’s own folder that draws on the wallpaper waits for the store');
}

async function checkCopy() {
  await installCopy(ID, ownFolder(ID));
  const copy = await reaches('copy', 'running', 'a copy the person installed runs inside the desktop');
  require(markers().includes(`${ID}:folder-1`) && copy.ignored.includes(ownFolder(ID)), 'its code ran inside the desktop, and the folder it came from is left alone');
  edit('folder-2');
  await request('Reload', ID);
  await pause(300);
  require((await listed(ID))?.origin === 'copy' && !markers().includes(`${ID}:folder-2`), 'changing the folder afterwards doesn’t change what runs');
  require(GLib.file_test(GLib.build_filenamev([unreviewedFolder(ID), 'extension.js']), GLib.FileTest.IS_REGULAR), 'the copy is in the folder the packages service keeps');
}

async function checkOff(origin: string) {
  await setDeveloperTools(false);
  await eventually(async () => {
    const found = await listed(ID);
    return found?.origin === origin && found.state === 'store-only';
  }, `with Developer tools off, the ${origin} goes back to waiting for the store at once`);
  require(!!await refused(() => installCopy(ID, ownFolder(ID))) && !!await refused(() => allowFolder(ID, ownFolder(ID))),
    'and the packages service refuses to approve anything');
  await setDeveloperTools(true);
  await eventually(async () => (await listed(ID))?.state === 'running', 'turning Developer tools on again runs it inside the desktop again');
}

async function checkRemovingCopy() {
  await removeUnreviewed(ID);
  await reaches('own', 'store-only', 'removing the copy goes back to the sandbox');
  require(!GLib.file_test(unreviewedFolder(ID), GLib.FileTest.EXISTS), 'and the copy is gone');
}

async function checkFolder() {
  await allowFolder(ID, ownFolder(ID));
  await reaches('folder', 'running', 'an approved folder runs inside the desktop');
  require(markers().includes(`${ID}:folder-2`), 'with what the folder holds');
  edit('folder-3');
  await request('Reload', ID);
  await eventually(async () => markers().includes(`${ID}:folder-3`), 'an edit to the approved folder runs on reload');
}

async function checkRemovingFolder() {
  await removeUnreviewed(ID);
  await reaches('own', 'store-only', 'taking the approval away goes back to the sandbox');
}

export async function run() {
  try {
    await checkSandboxedFirst();
    await checkCopy();
    await checkOff('copy');
    await checkRemovingCopy();
    await checkFolder();
    await checkOff('folder');
    await checkRemovingFolder();
    require((await packagesCalls(ID)).join() === [
      `Packages InstallUnreviewedExtension ${ID}`, `Packages RemoveUnreviewedExtension ${ID}`,
      `Packages AllowExtensionFolder ${ID} ${ownFolder(ID)}`, `Packages RemoveUnreviewedExtension ${ID}`,
    ].join(), 'every approval and removal went through the packages service');
  } finally {
    await setDeveloperTools(true);
    await removeUnreviewed(ID);
    await request('Remove', ID);
    if (GLib.file_test(ownFolder(ID), GLib.FileTest.IS_DIR)) removeFolder(Gio.File.new_for_path(ownFolder(ID)));
  }
}
