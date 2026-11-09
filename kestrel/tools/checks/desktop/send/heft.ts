import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import {appBinary} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {click} from '../../lib/input/input.js';
import {outcome, scratch, waitForWindow} from '../../lib/processes.js';
import {captureArea} from '../../lib/screenshots.js';
import {pause, settled} from '../../lib/wait.js';
import {Caller, type Files} from './caller.js';
import {savePicture} from './files.js';

const {require, eventually} = checks('Send sheet');
const HEFT = 'com.lantharos.Heft';
/** Where the first subject sits in Heft's import dialog, from the middle of its window. */
const FIRST_SUBJECT: [number, number] = [-140, 19];
const LOADING = 3000;

const children = (folder: Gio.File) => folder.query_exists(null)
  ? [...folder.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null)].map(info => folder.get_child(info.get_name()))
  : [];

/** What Heft keeps in one folder of the notebook it made for `name`, in whichever subject. */
function kept(name: string, folder: string): string[] {
  const library = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_home_dir(), 'Documents', 'Heft']));
  const notebook = children(library).map(subject => subject.get_child(`${name}.heft`)).find(found => found.query_exists(null));
  return notebook ? children(notebook.get_child(folder)).map(file => file.get_basename()!) : [];
}

const windowArea = (window: Meta.Window) => {
  const {x, y, width, height} = window.get_frame_rect();
  return {x, y, width, height};
};

async function sendTo(files: Files, choice: (name: string) => Clutter.Actor | null, label: string): Promise<Meta.Window> {
  const caller = await Caller.start(files, `an app with ${label} opens`);
  try {
    await caller.send();
    await eventually(() => choice('Heft'), `the Send sheet offers Heft for ${label}`);
    await settled();
    click(choice('Heft')!);
    require(await caller.next('the sheet closes') === 'sent', `choosing Heft for ${label} closes the sheet`);
  } finally {
    await caller.stop();
  }
  const heft = await waitForWindow(window => window.get_wm_class() === HEFT, 'Heft opens with it', 60000);
  heft.activate(global.get_current_time());
  await pause(LOADING);
  await settled();
  await captureArea(`send-heft-${label.replace(/\W+/g, '-')}`, windowArea(heft));
  const {x, y, width, height} = heft.get_frame_rect();
  click([x + width / 2 + FIRST_SUBJECT[0], y + height / 2 + FIRST_SUBJECT[1]]);
  return heft;
}

/** Sends a PDF and then a picture to Heft from the sheet; each goes into the subject people pick, as when Heft opens them. */
export async function checkHeft(choice: (name: string) => Clutter.Actor | null, scan: string) {
  if (!GLib.file_test(appBinary('heft'), GLib.FileTest.IS_EXECUTABLE)) {
    console.log('Kestrel Send sheet: Heft skipped while it isn\'t built');
    return;
  }
  const picture = GLib.build_filenamev([scratch('send'), 'Whiteboard.png']);
  savePicture(picture);
  const heft = await sendTo({'Scan.pdf': scan}, choice, 'a PDF');
  try {
    await eventually(() => kept('Scan', 'sources').some(name => name.endsWith('.pdf')), 'the PDF becomes a book in Heft', 15000);
    await sendTo({'Whiteboard.png': picture}, choice, 'a picture');
    await eventually(() => kept('Whiteboard', 'assets').some(name => name.endsWith('.png')), 'the picture goes into a new notebook in Heft', 15000);
    await pause(LOADING);
    await captureArea('send-heft-notebook', windowArea(heft));
  } finally {
    await outcome(['kill', String(heft.get_pid())]);
  }
}
