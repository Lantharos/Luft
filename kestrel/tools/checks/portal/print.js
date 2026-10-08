import Cairo from 'cairo';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {firstStyled, labelled, named, shown, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, type} from '../lib/input.js';
import {BACKEND, call, PORTAL_PATH, portalDialog, requestHandle} from '../lib/portal.js';
import {scratch} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

Gio._promisify(Gio.DBusConnection.prototype, 'call_with_unix_fd_list');
Gio._promisify(Gio.Subprocess.prototype, 'communicate_utf8_async');

const {require, eventually} = checks('print');
const APP = 'com.lantharos.draft';
const PRINTER = 'Office';
const JOB_TIMEOUT = 10000;
const string = value => new GLib.Variant('s', value);
const double = value => new GLib.Variant('d', value);

function writeDocument(path) {
  const surface = new Cairo.PDFSurface(path, 595, 842);
  const context = new Cairo.Context(surface);
  for (const page of [1, 2, 3]) {
    context.moveTo(72, 120);
    context.setFontSize(32);
    context.showText(`Page ${page}`);
    context.showPage();
  }
  context.$dispose();
  surface.finish();
}

async function completedJobs() {
  const lpstat = Gio.Subprocess.new(['lpstat', '-W', 'completed', '-o', PRINTER], Gio.SubprocessFlags.STDOUT_PIPE);
  const [output] = await lpstat.communicate_utf8_async(null, null);
  return output.split('\n').filter(Boolean).length;
}

function printDocument(path, options) {
  const document = Gio.UnixFDList.new_from_array([GLib.open(path, 0, 0)]);
  return Gio.DBus.session.call_with_unix_fd_list(BACKEND, PORTAL_PATH, 'org.freedesktop.impl.portal.Print', 'Print',
    new GLib.Variant('(osssha{sv})', [requestHandle(), APP, '', 'Print', 0, options]), new GLib.VariantType('(ua{sv})'),
    Gio.DBusCallFlags.NONE, -1, document, null).then(([reply]) => reply.recursiveUnpack());
}

const field = (dialog, label) => styled('kestrel-print-field', dialog).find(actor => actor.get_first_child().text === label);

async function openedDialog(label) {
  await eventually(() => portalDialog(), label);
  await settled();
  return portalDialog();
}

async function choose(dialog, label) {
  await settled();
  const segment = labelled(label, dialog);
  click(segment);
  await eventually(() => segment.checked, `${label} can be chosen`);
}

async function pickFrom(opener, choice, label, listed = [choice]) {
  await eventually(() => shown(labelled(opener, portalDialog())), `${opener} can be opened`);
  await settled();
  click(labelled(opener, portalDialog()));
  await eventually(() => listed.every(item => shown(labelled(item, portalDialog()))), label);
  await settled();
  click(labelled(choice, portalDialog()));
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

async function checkOptions(dialog) {
  const copies = named('Copies', dialog);
  click(labelled('More copies', dialog));
  await eventually(() => copies.text === '2', 'more copies can be asked for');
  await choose(dialog, 'Range');
  const accept = labelled('Print', dialog);
  require(!accept.reactive, 'an empty page range cannot be printed');
  const ranges = firstStyled('kestrel-print-ranges', dialog);
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
  await eventually(() => !field(portalDialog(), 'Two-sided') && !field(portalDialog(), 'Color') && labelled('A5', portalDialog()),
    'options follow what the chosen printer can do');
  await pickFrom('Label Printer', 'Office Printer', 'the printer list opens again');
  await eventually(() => field(portalDialog(), 'Two-sided'), 'the first printer comes back with its options');
  dialog = portalDialog();
  await settled();
  click(labelled('Print', dialog));

  const [response, {settings, 'page-setup': pageSetup, token}] = (await prepared).recursiveUnpack();
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
  click(labelled('Cancel', dialog));
  require((await reused)[0] === 1, 'cancelling the print dialog prints nothing');

  const direct = printDocument(documentPath, {});
  dialog = await openedDialog('printing a document asks first');
  const counted = await completedJobs();
  click(labelled('Print', dialog));
  require((await direct)[0] === 0, 'apps can print a document directly');
  await eventually(async () => await completedJobs() > counted, 'the direct print job finishes', JOB_TIMEOUT);
  Gio.File.new_for_path(documentPath).delete(null);
}
