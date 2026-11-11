import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {pause} from '../lib/wait.js';
import {developmentFolder, install, listed, ownFolder, removeFolder, request, rewrite, storeFolder} from './lib/extensions.js';

const {require, eventually} = checks('extensions');
const STORE = 'com.example.Marker';
const OWN = 'com.example.Own';
const NEWER = 'com.example.Newer';
const RUNNING_LUFT = '1.2-nightly.21';

const markers = () => (globalThis as {markers?: string[]}).markers ?? [];
const state = async (id: string) => (await listed(id))?.state;

function installAs(id: string, folder: (id: string) => string, version = '1.0.0') {
  install('marker', id, folder);
  rewrite(GLib.build_filenamev([folder(id), 'extension.toml']), text => text.replace('com.example.Marker', id).replace('version = "1.0.0"', `version = "${version}"`));
}

async function checkStoreFolder() {
  installAs(STORE, storeFolder);
  await request('Reload', STORE);
  const store = await eventually(async () => {
    const found = await listed(STORE);
    return found?.state === 'running' ? found : null;
  }, 'an extension in the store’s folder runs inside the desktop');
  require(store.origin === 'store' && markers().includes(STORE), 'it is listed as one from the store, and its code ran');
}

async function checkIgnoredCopy() {
  installAs(STORE, ownFolder, '9.9.9');
  await request('Reload', STORE);
  const store = await eventually(async () => {
    const found = await listed(STORE);
    return found?.ignored.includes(ownFolder(STORE)) ? found : null;
  }, 'a copy of it in the account’s own folder is listed as ignored');
  require(store.origin === 'store' && store.version === '1.0.0' && store.state === 'running', 'and the store’s copy is the one that runs');
}

async function checkOwnFolder() {
  installAs(OWN, ownFolder);
  await request('Reload', OWN);
  const own = await eventually(() => listed(OWN), 'an extension only in the account’s own folder is listed');
  require(own.origin === 'own' && own.state === 'runs-separately', `it is shown as one that can’t run inside the desktop (${own.state})`);
  await request('Enable', OWN);
  await pause(300);
  require(!markers().includes(OWN), 'turning it on still never runs its code inside the desktop');
}

async function checkNewerLuft() {
  install('newer', NEWER);
  await request('Reload', NEWER);
  await eventually(async () => await state(NEWER) === 'needs-newer-luft', 'an extension asking for a newer Luft is listed as needing one');
  await pause(300);
  require(!markers().includes(NEWER), 'and never runs');
  const manifest = GLib.build_filenamev([developmentFolder(NEWER), 'extension.toml']);
  for (const minimum of [RUNNING_LUFT, '1.0']) {
    rewrite(manifest, text => text.replace(/minimum = ".*"/, `minimum = "${minimum}"`));
    await request('Reload', NEWER);
    await eventually(async () => await state(NEWER) === 'running', `one asking for Luft ${minimum} runs on ${RUNNING_LUFT}`);
    require(markers().includes(NEWER), 'and its code ran');
  }
}

export async function run() {
  try {
    await checkStoreFolder();
    await checkIgnoredCopy();
    await checkOwnFolder();
    await checkNewerLuft();
  } finally {
    for (const id of [STORE, OWN, NEWER]) await request('Remove', id);
    if (GLib.file_test(ownFolder(STORE), GLib.FileTest.IS_DIR)) removeFolder(Gio.File.new_for_path(ownFolder(STORE)));
    await request('Reload', STORE);
  }
}
