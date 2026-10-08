import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {dismissImmediately} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {rest} from '../checks/lib/input.js';
import {stopAll} from '../checks/lib/processes.js';
import {settled} from '../checks/lib/wait.js';
import {endSession, runGroup} from './runner.js';

const FILE_MANAGER = 'com.lantharos.rover.desktop';

function claim() {
  const queue = Gio.File.new_for_path(GLib.getenv('KESTREL_CAPTURE_QUEUE'));
  const claimed = Gio.File.new_for_path(GLib.getenv('KESTREL_CAPTURE_CLAIMED'));
  const names = [...queue.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null)].map(info => info.get_name()).sort();
  for (const name of names) {
    try {
      queue.get_child(name).move(claimed.get_child(`${name}@${GLib.getenv('KESTREL_CAPTURE_WORKER')}`), Gio.FileCopyFlags.NO_FALLBACK_FOR_MOVE, null, null);
      return name.replace(/^\d+-/, '');
    } catch {
      continue;
    }
  }
  return null;
}

function pinFileManager() {
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  if (!settings.get_strv('favorite-apps').includes(FILE_MANAGER))
    settings.set_strv('favorite-apps', [FILE_MANAGER, ...settings.get_strv('favorite-apps')]);
}

async function reset() {
  dismissImmediately();
  await stopAll();
  global.workspace_manager.get_workspace_by_index(0).activate(global.get_current_time());
  rest();
  await settled();
  if (Main.screenShield.locked) throw new Error('The group left the screen locked');
  if (Main.modalCount > 0) throw new Error('The group left a dialog open');
}

export async function run() {
  pinFileManager();
  await settled();
  try {
    for (let group = claim(); group; group = claim()) {
      if (!await runGroup(group, reset)) throw new Error(`${group} failed, ending this session`);
    }
  } finally {
    await endSession();
  }
}
