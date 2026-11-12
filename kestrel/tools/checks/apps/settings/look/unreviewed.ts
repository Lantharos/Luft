import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import type {Point} from '../../../lib/input/input.js';
import type {Frame} from '../../../lib/screenshots.js';
import {checks} from '../../../lib/check.js';
import {listed, ownFolder, removeFolder, request} from '../../../extensions/lib/extensions.js';
import {installOwn} from '../../../extensions/lib/sandbox.js';
import {packagesCalls, removeUnreviewed, setDeveloperTools} from '../../../extensions/lib/unreviewed.js';
import {show} from '../navigation.js';

const {eventually, require} = checks('Luft app');
const ID = 'com.example.Unreviewed';
const PAGE = `extensions/${ID.toLowerCase()}`;
const INSTALL_COPY: Point = [660, 452];
const CONFIRM_COPY: Point = [660, 461];
const STOP: Point = [966, 340];
const RUN_FROM_FOLDER: Point = [660, 520];
const CONFIRM_FOLDER: Point = [645, 512];
const TAKE_BACK: Point = [955, 444];
const PAGE_CONTENT = {x: 300, y: 60, width: 720, height: 360};

const alike = (frame: Frame, other: Frame) => frame.pixelsApart(other, 24) < 200;

const origin = async () => (await listed(ID))?.origin;

export async function checkUnreviewed(app: LuftApp) {
  await setDeveloperTools(false);
  installOwn('marker', ID, text => `${text}permissions = ["wallpaper"]\n`);
  await request('Reload', ID);
  try {
    await eventually(async () => (await listed(ID))?.state === 'store-only', 'an extension from the own folder that draws on the wallpaper waits');
    const off = await show(app, PAGE);
    off.save('settings-extension-unreviewed-off');
    const offContent = await app.frame(app.area(PAGE_CONTENT));
    await setDeveloperTools(true);
    const offer = await app.changes(off, 'with Developer tools on, the page offers to run it inside Luft');
    offer.save('settings-extension-unreviewed-offer');
    const offerContent = await app.frame(app.area(PAGE_CONTENT));
    app.click(INSTALL_COPY);
    const copyDialog = await app.changes(offer, 'installing a copy opens a dialog first');
    copyDialog.save('settings-extension-unreviewed-copy-dialog');
    app.click(CONFIRM_COPY);
    await eventually(async () => await origin() === 'copy', 'confirming has the packages service install a copy that runs inside Luft');
    const copy = await app.settle(frame => !frame.looksLike(copyDialog));
    copy.save('settings-extension-unreviewed-copy');
    (await show(app, 'extensions')).save('settings-extensions-unreviewed-listing');
    await show(app, PAGE);
    app.click(STOP);
    await eventually(async () => await origin() === 'own', 'stopping takes the copy away at once, without a password');
    const sandboxed = await app.settle(frame => alike(frame, offerContent), app.area(PAGE_CONTENT));
    require(alike(sandboxed, offerContent), 'and the page offers both ways again');
    app.click(RUN_FROM_FOLDER);
    await app.changes(sandboxed, 'running from its folder opens a dialog first', app.area(PAGE_CONTENT));
    const folderDialog = await app.frame();
    folderDialog.save('settings-extension-unreviewed-folder-dialog');
    app.click(CONFIRM_FOLDER);
    await eventually(async () => await origin() === 'folder', 'confirming has the packages service approve the folder');
    (await app.settle(frame => !frame.looksLike(folderDialog))).save('settings-extension-unreviewed-folder');
    const folder = await app.frame(app.area(PAGE_CONTENT));
    await setDeveloperTools(false);
    await eventually(async () => (await listed(ID))?.state === 'store-only', 'with Developer tools off, the approved folder goes back to its sandbox');
    await app.changes(folder, 'and the page no longer offers to reload it', app.area(PAGE_CONTENT));
    (await app.frame()).save('settings-extension-unreviewed-folder-off');
    app.click(TAKE_BACK);
    await eventually(async () => await origin() === 'own', 'taking the approval back needs no password, even with Developer tools off');
    const back = await app.settle(frame => alike(frame, offContent), app.area(PAGE_CONTENT));
    require(alike(back, offContent), 'with Developer tools off the page offers nothing again');
    const calls = (await packagesCalls(ID)).join();
    require(calls === [
      `Packages InstallUnreviewedExtension ${ID}`, `Packages RemoveUnreviewedExtension ${ID}`,
      `Packages AllowExtensionFolder ${ID} ${ownFolder(ID)}`, `Packages RemoveUnreviewedExtension ${ID}`,
    ].join(), `Settings asked the packages service for each approval and removal: ${calls}`);
  } finally {
    await setDeveloperTools(true);
    await removeUnreviewed(ID);
    await request('Remove', ID);
    if (GLib.file_test(ownFolder(ID), GLib.FileTest.IS_DIR)) removeFolder(Gio.File.new_for_path(ownFolder(ID)));
  }
}
