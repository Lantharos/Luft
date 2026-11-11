import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {press, type Point} from '../../lib/input/input.js';
import {callLog} from '../../system/lib/systemCalls.js';
import {changes} from '../lib/apps.js';
import {children, write} from '../lib/files.js';

const {eventually} = checks('Luft app');
const FIRST_ROW: Point = [330, 104];
const NAMES = ['Alder.txt', 'Birch.txt', 'Cedar.txt', 'Dogwood.txt'];
const NOT_WRITABLE = 0o555;
const WRITABLE = 0o755;

type Open = (app: LuftApp, path: string) => Promise<void>;

export async function checkPrivileged(app: LuftApp, folder: string, open: Open) {
  for (const name of NAMES) write(GLib.build_filenamev([folder, name]), `${name}\n`);
  GLib.chmod(folder, NOT_WRITABLE);
  const calls = callLog();
  const asked = () => calls().filter(call => call.startsWith('Files1.')).join(', ');
  const left = () => children(folder).map(info => info.get_name()).sort().join(', ');
  try {
    await open(app, folder);
    await changes(app, 'Rover selects a file in a folder the account can’t change', () => app.click(FIRST_ROW));
    await changes(app, 'Ctrl+A selects them all', () => press(Clutter.KEY_Control_L, Clutter.KEY_a));
    press(Clutter.KEY_Delete);
    await eventually(() => left() === '' && asked() === 'Files1.Trash 4', 'Rover asks an administrator once to trash four files it can’t move itself');
    press(Clutter.KEY_Control_L, Clutter.KEY_z);
    await eventually(() => left() === NAMES.join(', ') && asked() === 'Files1.Trash 4, Files1.Move 4', 'undoing it asks once to bring all four back');
  } finally {
    GLib.chmod(folder, WRITABLE);
  }
}
