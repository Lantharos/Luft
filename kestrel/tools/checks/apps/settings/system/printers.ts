import Gio from 'gi://Gio';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import type {Query} from '../../../lib/apps/probe.js';
import {checks} from '../../../lib/check.js';
import {callLog} from '../../../system/lib/systemCalls.js';
import {useScheme} from '../../lib/palette.js';
import {scrollToEnd, show} from '../navigation.js';

const OFFICE = {text: 'Office Printer'};
const BACK = {role: 'button', name: 'Back'};
const ADD = {role: 'button', name: 'Add a printer'};
const LABELS = {text: 'Label Printer'};
const USB_PRINTER = {text: 'Canon MX490 series'};
const DRIVER = {text: 'Canon MX490 series - CUPS+Gutenprint v5.3.5'};
const CANCEL_JOB = {role: 'button', name: 'Cancel printing'};
const TEST_PAGE = {role: 'button', name: 'Print a test page'};

async function restyle(app: LuftApp, label: string, change: () => void) {
  const before = await app.frame();
  change();
  return app.changes(before, label);
}

async function click(app: LuftApp, control: Query, label: string) {
  const target = await app.find(control);
  const before = await app.frame();
  app.click(target);
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
