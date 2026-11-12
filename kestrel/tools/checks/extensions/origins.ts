import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {pause} from '../lib/wait.js';
import {developmentFolder, install, listed, ownFolder, removeFolder, request, rewrite, storeFolder} from './lib/extensions.js';
import {hostsOf, installOwn} from './lib/sandbox.js';
import {installFromStore, sandboxedStoreFolder, sandboxLeavesOut} from './lib/store.js';
import {refused} from './lib/unreviewed.js';

const {require, eventually} = checks('extensions');
const STORE = 'com.example.Marker';
const OWN = 'com.example.Own';
const NEWER = 'com.example.Newer';
const OWN_NEWER = 'com.example.OwnNewer';
const SANDBOXED_STORE = 'com.example.StoreSandboxed';
const STORE_DRAWING = 'com.example.StoreDrawing';
const RUNNING_LUFT = '1.2-nightly.21';

const markers = () => (globalThis as {markers?: string[]}).markers ?? [];
const state = async (id: string) => (await listed(id))?.state;
const exists = (folder: string) => GLib.file_test(folder, GLib.FileTest.EXISTS);
const sandboxHosts = (id: string) => hostsOf(id, sandboxedStoreFolder(id));

async function reaches(id: string, origin: string, wanted: string, label: string) {
  await request('Reload', id);
  return eventually(async () => {
    const found = await listed(id);
    return found?.origin === origin && found.state === wanted ? found : null;
  }, label, 20000);
}

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
  const own = await eventually(async () => {
    const found = await listed(OWN);
    return found?.state === 'running' ? found : null;
  }, 'an extension only in the account’s own folder runs', 20000);
  require(own.origin === 'own' && !markers().includes(OWN), 'it runs in its sandbox, never inside the desktop');
}

async function checkSandboxedStore() {
  await installFromStore('marker', SANDBOXED_STORE, {version: '1.0.0', approved: false});
  await reaches(SANDBOXED_STORE, 'store-sandboxed', 'running', 'a store release not approved to run inside the desktop runs');
  require(!markers().includes(SANDBOXED_STORE), 'none of its code ran inside the desktop');
  await eventually(() => sandboxHosts(SANDBOXED_STORE).length > 0, 'it runs in a host of its own, in a sandbox');
  require(!exists(storeFolder(SANDBOXED_STORE)), 'and it never lands in the folder of releases approved to run inside the desktop');
}

async function checkApprovedUpdate() {
  await installFromStore('marker', SANDBOXED_STORE, {version: '1.1.0', approved: true});
  const inside = await reaches(SANDBOXED_STORE, 'store', 'running', 'an approved update moves it inside the desktop');
  require(inside.version === '1.1.0' && markers().includes(SANDBOXED_STORE) && !exists(sandboxedStoreFolder(SANDBOXED_STORE)),
    'its code runs inside the desktop, and no sandboxed copy is left');
  await eventually(() => !sandboxHosts(SANDBOXED_STORE).length, 'and its sandbox ends');
  const refusal = await refused(() => installFromStore('marker', SANDBOXED_STORE, {version: '1.2.0', approved: false}));
  require(!!refusal?.includes('approved version stays') && (await listed(SANDBOXED_STORE))?.version === '1.1.0',
    `a newer release that isn't approved yet doesn't replace the approved one (${refusal})`);
}

async function checkStoreDrawing() {
  await installFromStore('marker', STORE_DRAWING, {version: '1.0.0', approved: false, permissions: ['wallpaper']});
  const drawing = await reaches(STORE_DRAWING, 'store-sandboxed', 'store-only', 'a store release that draws on the wallpaper, not approved to run inside the desktop, waits');
  require(drawing.problem.includes('wallpaper') && (await sandboxLeavesOut()).includes('wallpaper'), `it says why, from the list Schelf reads (${drawing.problem})`);
  await pause(300);
  require(!sandboxHosts(STORE_DRAWING).length && !markers().includes(STORE_DRAWING), 'and it runs nowhere');
}

async function checkOwnNewerLuft() {
  installOwn('newer', OWN_NEWER);
  await request('Reload', OWN_NEWER);
  await eventually(async () => await state(OWN_NEWER) === 'needs-newer-luft', 'one in the own folder asking for a newer Luft waits too');
  await pause(300);
  require(!hostsOf(OWN_NEWER).length, 'and no sandbox starts for it');
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
    await checkSandboxedStore();
    await checkApprovedUpdate();
    await checkStoreDrawing();
    await checkOwnNewerLuft();
    await checkNewerLuft();
  } finally {
    for (const id of [STORE, OWN, OWN_NEWER, NEWER, SANDBOXED_STORE, STORE_DRAWING]) await request('Remove', id);
    if (GLib.file_test(ownFolder(STORE), GLib.FileTest.IS_DIR)) removeFolder(Gio.File.new_for_path(ownFolder(STORE)));
    await request('Reload', STORE);
  }
}
