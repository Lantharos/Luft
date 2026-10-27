import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {firstStyled, labelled, named, ofType, shown, styled, textOf} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, type} from '../lib/input/input.js';
import {backendOf, call, PORTAL_PATH, portalDialog, requestHandle} from '../lib/access/portal.js';
import {completedJobs, JOB_TIMEOUT, PRINTER, writeDocument} from '../lib/access/printing.js';
import {scratch} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

Gio._promisify(Gio.DBusConnection.prototype, 'call_with_unix_fd_list');

const {require, eventually} = checks('print');
const APP = 'com.lantharos.draft';
const string = (value: string) => new GLib.Variant('s', value);
const double = (value: number) => new GLib.Variant('d', value);

interface PreparedPrint {
  settings: Record<string, string>;
  'page-setup': Record<string, string | number>;
  token: number;
}

function printDocument(path: string, options: Record<string, GLib.Variant>) {
  const document = Gio.UnixFDList.new_from_array([GLib.open(path, 0, 0)]);
  return Gio.DBus.session.call_with_unix_fd_list(backendOf('Print'), PORTAL_PATH, 'org.freedesktop.impl.portal.Print', 'Print',
    new GLib.Variant('(osssha{sv})', [requestHandle(), APP, '', 'Print', 0, options]), new GLib.VariantType('(ua{sv})'),
    Gio.DBusCallFlags.NONE, -1, document, null).then(([reply]) => reply.recursiveUnpack<[number, Record<string, unknown>]>());
}

const field = (dialog: Clutter.Actor, label: string) => styled('kestrel-print-field', dialog).find(actor => textOf(actor.get_first_child()) === label);
const currentDialog = () => ofType(portalDialog(), St.Widget);

async function openedDialog(label: string) {
  await eventually(() => portalDialog(), label);
  await settled();
  return currentDialog();
}

async function choose(dialog: Clutter.Actor, label: string) {
  await settled();
  const segment = ofType(labelled(label, dialog), St.Button);
  click(segment);
  await eventually(() => segment.checked, `${label} can be chosen`);
}

async function pickFrom(opener: string, choice: string, label: string, listed = [choice]) {
  await eventually(() => shown(labelled(opener, currentDialog())), `${opener} can be opened`);
  await settled();
  click(ofType(labelled(opener, currentDialog()), Clutter.Actor));
  await eventually(() => listed.every(item => shown(labelled(item, currentDialog()))), label);
  await settled();
  click(ofType(labelled(choice, currentDialog()), Clutter.Actor));
}

function preparePrint() {
  return call('Print', 'PreparePrint', new GLib.Variant('(osssa{sv}a{sv}a{sv})', [requestHandle(), APP, '', 'Print', {
    printer: string(PRINTER),
    'n-copies': string('1'),
    'output-uri': string('file:///tmp/old-print.pdf'),
  }, {
    Name: string('iso_a4'),
    DisplayName: string('A4'),
    Width: double(210),
    Height: double(297),
    MarginTop: double(6.35),
    Orientation: string('portrait'),
  }, {
    accept_label: string('_Print'),
    has_current_page: new GLib.Variant('b', true),
  }]), '(ua{sv})');
}

async function checkOptions(dialog: Clutter.Actor) {
  const copies = ofType(named('Copies', dialog), St.Entry);
  click(ofType(labelled('More copies', dialog), Clutter.Actor));
  await eventually(() => copies.text === '2', 'more copies can be asked for');
  await choose(dialog, 'Range');
  const accept = ofType(labelled('Print', dialog), Clutter.Actor);
  require(!accept.reactive, 'an empty page range cannot be printed');
  const ranges = ofType(firstStyled('kestrel-print-ranges', dialog), St.Entry);
  await eventually(() => global.stage.get_key_focus() === ranges.clutter_text, 'the page range takes the typing');
  type('2-3');
  await eventually(() => accept.reactive, 'a page range can be typed');
  for (const label of ['Landscape', 'Long edge', 'Black & white']) await choose(dialog, label);
  await pickFrom('A4', 'A5', 'the paper list shows what the printer takes', ['Letter', 'A5']);
}

export async function run() {
  if (!GLib.getenv('CUPS_SERVER')) throw new Error('The print checks need the print server fixture');
  const documentPath = scratch('print-check.pdf');
  writeDocument(documentPath);

  const prepared = preparePrint();
  let dialog = await openedDialog('printing asks how to print');
  require(['Copies', 'Pages', 'Paper', 'Orientation', 'Two-sided', 'Color'].every(label => field(dialog, label)) && labelled('Office Printer', dialog),
    'the print dialog offers the printer and its options');
  await capture('portal-print');
  await checkOptions(dialog);

  await pickFrom('Office Printer', 'Label Printer', 'the printer list opens');
  await eventually(() => !field(currentDialog(), 'Two-sided') && !field(currentDialog(), 'Color') && labelled('A5', currentDialog()),
    'options follow what the chosen printer can do');
  await pickFrom('Label Printer', 'Office Printer', 'the printer list opens again');
  await eventually(() => field(currentDialog(), 'Two-sided'), 'the first printer comes back with its options');
  dialog = currentDialog();
  await settled();
  click(ofType(labelled('Print', dialog), Clutter.Actor));

  const [response, {settings, 'page-setup': pageSetup, token}] = (await prepared).recursiveUnpack<[number, PreparedPrint]>();
  require(response === 0 && settings.printer === PRINTER && settings['n-copies'] === '2' && settings['print-pages'] === 'ranges'
    && settings['page-ranges'] === '1-2' && settings.duplex === 'vertical' && settings['use-color'] === 'false'
    && settings['output-file-format'] === 'pdf' && !('output-uri' in settings), 'apps get the chosen print settings');
  require(pageSetup.Name === 'iso_a5_148x210mm' && pageSetup.Width === 148 && pageSetup.Height === 210 && pageSetup.Orientation === 'landscape'
    && pageSetup.MarginTop === 6.35, 'apps get the chosen paper and orientation');

  const before = await completedJobs();
  const [printed] = await printDocument(documentPath, {token: new GLib.Variant('u', token)});
  require(printed === 0, 'the prepared document is printed without asking again');
  await eventually(async () => await completedJobs() > before, 'the print job finishes', JOB_TIMEOUT);

  const reused = printDocument(documentPath, {token: new GLib.Variant('u', token)});
  dialog = await openedDialog('a used token asks again');
  require(!field(dialog, 'Orientation') && field(dialog, 'Pages'), 'a used token asks again, without layout options');
  await capture('portal-print-document');
  click(ofType(labelled('Cancel', dialog), Clutter.Actor));
  require((await reused)[0] === 1, 'cancelling the print dialog prints nothing');

  const direct = printDocument(documentPath, {});
  dialog = await openedDialog('printing a document asks first');
  const counted = await completedJobs();
  click(ofType(labelled('Print', dialog), Clutter.Actor));
  require((await direct)[0] === 0, 'apps can print a document directly');
  await eventually(async () => await completedJobs() > counted, 'the direct print job finishes', JOB_TIMEOUT);
  Gio.File.new_for_path(documentPath).delete(null);
}
