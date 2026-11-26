import type {LuftApp} from '../../../lib/apps/luftApp.js';
import type {Query} from '../../../lib/apps/probe.js';
import {checks} from '../../../lib/check.js';
import {callLog} from '../../../system/lib/systemCalls.js';
import {show} from '../navigation.js';

const OFFICE = {text: 'Office Printer'};
const BACK = {role: 'button', name: 'Back'};
const ADD = {role: 'button', name: 'Add a printer'};
const LABELS = {text: 'Label Printer'};
const USB_PRINTER = {text: 'Canon MX490 series'};
const DRIVER = {text: 'Canon MX490 series - CUPS+Gutenprint v5.3.5'};
const CANCEL_JOB = {role: 'button', name: 'Cancel printing'};
const TEST_PAGE = {role: 'button', name: 'Print a test page'};

async function click(app: LuftApp, control: Query, label: string) {
  const target = await app.find(control);
  const before = await app.frame();
  app.click(target);
  return app.changes(before, label);
}

const {eventually} = checks('Luft app');

export async function checkPrinters(app: LuftApp) {
  const calls = callLog();
  (await show(app, 'printers')).save('settings-printers-dark');
  (await click(app, OFFICE, 'opening a printer shows its page')).save('settings-printers-office-dark');
  await click(app, BACK, 'going back lists the printers');
  (await click(app, ADD, 'adding a printer opens a dialog')).save('settings-printers-add-dark');
  (await click(app, USB_PRINTER, 'a USB printer asks for its driver')).save('settings-printers-driver-dark');
  (await click(app, DRIVER, 'choosing the suggested driver adds the printer')).save('settings-printers-added-dark');
  await eventually(() => calls().some(call => call.startsWith('AddPrinter usb://Canon/MX490') && call.endsWith('bjc-MX490-series/expert')), 'the USB printer is added with the driver made for it');
  (await click(app, LABELS, 'the label printer shows its queue')).save('settings-printers-labels-dark');
  (await click(app, CANCEL_JOB, 'canceling the held job empties the queue')).save('settings-printers-canceled-dark');
  (await click(app, TEST_PAGE, 'a test page is sent')).save('settings-printers-test-page-dark');
}
