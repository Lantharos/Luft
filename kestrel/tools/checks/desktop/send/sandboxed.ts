import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../../lib/check.js';
import {press} from '../../lib/input/input.js';
import {builtFixture, outcome, scratch} from '../../lib/processes.js';
import {capture} from '../../lib/screenshots.js';
import {settled} from '../../lib/wait.js';
import {IN_SESSION, install, launchLine, SABINE_BUILDER} from '../../apps/lib/appImages.js';
import {Caller, callerArguments} from './caller.js';

const {require, eventually} = checks('Send sheet');
const DENIED = 'org.freedesktop.DBus.Error.AccessDenied';

export async function checkSandboxed(sheet: () => unknown, pdf: Uint8Array) {
  if (!GLib.find_program_in_path('squashfuse_ll')) {
    console.log('Kestrel Send sheet: the sandboxed app skipped without squashfuse');
    return;
  }
  const image = scratch('Courier.AppImage');
  require((await outcome(['python3', SABINE_BUILDER, image, 'org.example.Courier', 'Courier', 'network = false\nfilesystems = ["home:ro"]\n'])).ok,
    'a Sabine AppImage that may read its home folder is built');
  const id = await install(image);
  const script = GLib.build_filenamev([GLib.get_home_dir(), 'send-caller.js']);
  Gio.File.new_for_path(builtFixture('clients', 'windows', 'sendCaller.js')).copy(Gio.File.new_for_path(script), Gio.FileCopyFlags.OVERWRITE, null, null);
  const letter = GLib.build_filenamev([GLib.get_home_dir(), 'Letter.pdf']);
  GLib.file_set_contents(letter, pdf);
  const {program, rest} = launchLine(id);
  const caller = await Caller.run([program, ...rest, 'gjs', '-m', script, ...callerArguments({'Letter.pdf': letter})],
    'a sandboxed app opens a window', window => window.get_sandboxed_app_id() === id, IN_SESSION);
  try {
    await caller.probe();
    const probed = JSON.parse((await caller.next('the sandboxed app tries Kestrel', 15000)).replace(/^probed /, '')) as Record<string, string>;
    require(probed.palette === 'answered', 'a sandboxed app reads Kestrel\'s palette');
    require(probed['file-actions'] === DENIED && probed.extensions === DENIED && probed['share-introspect'] === DENIED,
      'and reaches nothing else of Kestrel\'s, neither the file actions nor the extensions, nor even the Send sheet\'s description');
    await caller.send();
    await eventually(sheet, 'a sandboxed app opens the Send sheet for a file it hands over');
    await settled();
    await capture('send-sheet-sandboxed');
    press(Clutter.KEY_Escape);
    require(await caller.next('the sheet closes') === 'sent', 'and hears once it closed');
  } finally {
    await caller.stop();
  }
}
