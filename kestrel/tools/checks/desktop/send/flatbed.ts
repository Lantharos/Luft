import type Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {showsText} from '../../lib/actors.js';
import {appBinary, LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {call} from '../../lib/dbus.js';
import {click, type Point} from '../../lib/input/input.js';
import {capture} from '../../lib/screenshots.js';
import {settled} from '../../lib/wait.js';
import {changes} from '../../apps/lib/apps.js';
import {withScheme} from '../../apps/lib/palette.js';

const {require, eventually} = checks('Send sheet');
const FLATBED = 'com.lantharos.Flatbed';
const OPEN_PICTURES: Point = [800, 733];
const SAVE: Point = [980, 29];
const SAVE_IN_DIALOG: Point = [813, 553];
const SEND: Point = [367, 436];
const SAVING_MS = 60000;

const answer = (path: string) => call('org.freedesktop.impl.portal.desktop.rover', '/org/freedesktop/portal/desktop',
  'com.lantharos.KestrelChecks.FileChooser', 'Answer', new GLib.Variant('(s)', [GLib.filename_to_uri(path, null)]));

/** Saves a page in Flatbed as a PDF and sends it on with Send…, which opens the sheet for the file it wrote. */
export async function checkFlatbed(sheet: () => Clutter.Actor | null, choice: (name: string) => Clutter.Actor | null,
  sent: () => string | null, picture: string) {
  if (!GLib.file_test(appBinary('flatbed'), GLib.FileTest.IS_EXECUTABLE)) {
    console.log('Kestrel Send sheet: Flatbed skipped while it isn\'t built');
    return;
  }
  const saved = GLib.build_filenamev([GLib.path_get_dirname(picture), 'Receipt.pdf']);
  const app = new LuftApp('flatbed', [], {}, {id: FLATBED});
  try {
    await app.open();
    await settled(1500);
    await answer(picture);
    await changes(app, 'Flatbed takes a page from a picture', () => app.click(OPEN_PICTURES));
    await changes(app, 'Save asks for a name and a format', () => app.click(SAVE));
    await answer(saved);
    app.click(SAVE_IN_DIALOG);
    await eventually(() => GLib.file_test(saved, GLib.FileTest.EXISTS), 'Flatbed saves the PDF where it was asked to', SAVING_MS);
    await settled(1500);
    app.click(SEND);
    const open = await eventually(sheet, 'Send… in Flatbed opens the Send sheet');
    require(showsText('Send “Receipt.pdf”', open), 'for the PDF it saved');
    require(!choice('Flatbed'), 'without offering Flatbed itself');
    await eventually(() => choice('Pixel 8'), 'with the extension\'s device');
    await settled();
    await capture('send-sheet-flatbed-dark');
    await withScheme('light', async () => {
      await settled();
      await capture('send-sheet-flatbed-light');
    });
    click(choice('Pixel 8')!);
    await eventually(() => !sheet(), 'choosing it closes the sheet');
    const copy = await eventually(sent, 'the extension gets the PDF Flatbed handed over');
    const digest = (path: string) => GLib.compute_checksum_for_data(GLib.ChecksumType.SHA256, GLib.file_get_contents(path)[1]);
    require(digest(copy) === digest(saved), 'whole');
  } finally {
    await app.close();
  }
}
