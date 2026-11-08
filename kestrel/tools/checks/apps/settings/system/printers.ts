import Gio from 'gi://Gio';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import type {Point} from '../../../lib/input/input.js';
import {checks} from '../../../lib/check.js';
import {callLog} from '../../../system/lib/systemCalls.js';
import {useScheme} from '../../lib/palette.js';
import {scrollToEnd, show} from '../navigation.js';

const OFFICE: Point = [660, 102];
const BACK: Point = [316, 30];
const ADD: Point = [660, 239];
const LABELS: Point = [660, 171];
const USB_PRINTER: Point = [440, 305];
const DRIVER: Point = [440, 258];
const CANCEL_JOB: Point = [979, 271];
const TEST_PAGE: Point = [660, 546];

async function restyle(app: LuftApp, label: string, change: () => void) {
  const before = await app.frame();
  change();
  return app.changes(before, label);
}

async function click(app: LuftApp, point: Point, label: string) {
  const before = await app.frame();
  app.click(point);
  return app.changes(before, label);
}

const {eventually} = checks('Luft app');

export async function checkPrinters(app: LuftApp) {
  const calls = callLog();
  useScheme('light');
  (await show(app, 'printers')).save('settings-printers-light');
  (await restyle(app, 'the printers page turns dark', () => useScheme('dark'))).save('settings-printers-dark');
  const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  try {
    (await restyle(app, 'the printers page gets square corners', () => kestrel.set_boolean('rounded-window-corners', false))).save('settings-printers-square');
  } finally {
    kestrel.reset('rounded-window-corners');
  }
  const office = await click(app, OFFICE, 'opening a printer shows its page');
  office.save('settings-printers-office-dark');
  (await scrollToEnd(app, office)).save('settings-printers-office-end-dark');
  await click(app, BACK, 'going back lists the printers');
  (await click(app, ADD, 'adding a printer opens a dialog')).save('settings-printers-add-dark');
  (await click(app, USB_PRINTER, 'a USB printer asks for its driver')).save('settings-printers-driver-dark');
  (await click(app, DRIVER, 'choosing the suggested driver adds the printer')).save('settings-printers-added-dark');
  await eventually(() => calls().some(call => call.startsWith('AddPrinter usb://Canon/MX490') && call.endsWith('bjc-MX490-series/expert')), 'the USB printer is added with the driver made for it');
  (await click(app, LABELS, 'the label printer shows its queue')).save('settings-printers-labels-dark');
  (await click(app, CANCEL_JOB, 'canceling the held job empties the queue')).save('settings-printers-canceled-dark');
  (await click(app, TEST_PAGE, 'a test page is sent')).save('settings-printers-test-page-dark');
}
