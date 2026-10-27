import GLib from 'gi://GLib';

import type {LuftApp} from '../lib/apps/luftApp.js';
import {checks} from '../lib/check.js';
import type {Point} from '../lib/input/input.js';
import {fixture, outcome, repository, scratch} from '../lib/processes.js';
import {withApp} from './lib/apps.js';

const {require} = checks('Schelf trust');
const SCHELF = repository('target', 'release', 'schelf');
const BUILDER = fixture('sandbox', 'trust.sh');
const APPIMAGE_BUILDER = fixture('sandbox', 'appimage.py');
const SAFE_STORAGE = fixture('sandbox', 'safeStorage');
const INSTALL_BUTTON: Point = [1030, 110];

async function saved(app: LuftApp, name: string) {
  (await app.settle(() => true)).save(name);
}

async function installClicked(app: LuftApp, name: string) {
  await app.settle(() => true);
  app.click(INSTALL_BUTTON);
  await saved(app, name);
}

export async function run() {
  const folder = scratch('schelf-trust');
  require((await outcome(['bash', BUILDER, folder])).ok, 'a Flatpak and two package files are built for the trust dialogs');
  const env = {FLATPAK_USER_DIR: GLib.build_filenamev([folder, 'flatpak'])};
  await withApp('schelf', ['schelf:full-access?org.example.Notes'], app => saved(app, 'schelf-trust-flatpak'), env);

  const electron = GLib.getenv('KESTREL_ELECTRON');
  if (electron) {
    const image = GLib.build_filenamev([folder, 'Lighthouse.AppImage']);
    require((await outcome(['python3', APPIMAGE_BUILDER, image, 'org.example.Lighthouse', 'Lighthouse', GLib.path_get_dirname(electron), SAFE_STORAGE])).ok,
      'an AppImage is built');
    require((await outcome([SCHELF, 'install', '--yes', image], {env})).ok, 'Schelf installs the AppImage');
    await withApp('schelf', ['schelf:full-access?org.example.Lighthouse'], app => saved(app, 'schelf-trust-appimage'), env);
  }

  await withApp('schelf', [GLib.build_filenamev([folder, 'vscode-release.rpm'])], app => installClicked(app, 'schelf-trust-source'), env);
  await withApp('schelf', [GLib.build_filenamev([folder, 'lantern-notes.rpm'])], app => installClicked(app, 'schelf-trust-package'), env);
}
