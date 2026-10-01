import Cairo from 'cairo';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { BACKEND, PORTAL_PATH, call, checker, clicker, descendants, labelled, portalDialog, requestHandle } from './backend.js';

Gio._promisify(Gio.DBusConnection.prototype, 'call_with_unix_fd_list');
Gio._promisify(Gio.Subprocess.prototype, 'communicate_utf8_async');

const require = checker('print');
const APP = 'com.lantharos.draft';
const PRINTER = 'Office';
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

async function jobFinished(pause, before) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (await completedJobs() > before) return true;
    await pause(150);
  }
  return false;
}

function printDocument(appId, path, options) {
  const document = Gio.UnixFDList.new_from_array([GLib.open(path, 0, 0)]);
  return Gio.DBus.session.call_with_unix_fd_list(BACKEND, PORTAL_PATH, 'org.freedesktop.impl.portal.Print', 'Print',
    new GLib.Variant('(osssha{sv})', [requestHandle(), appId, '', 'Print', 0, options]), new GLib.VariantType('(ua{sv})'),
    Gio.DBusCallFlags.NONE, -1, document, null).then(([reply]) => reply.recursiveUnpack());
}

function field(dialog, label) {
  return descendants(dialog).find(actor => actor.has_style_class_name?.('kestrel-print-field') && actor.get_first_child().text === label);
}

export async function checkPrint({pause, capture, output, keyboard, pointer}) {
  if (!GLib.getenv('CUPS_SERVER')) throw new Error('The print checks need the print server fixture');
  const click = clicker(pointer, pause);
  const type = text => {
    for (const character of text) {
      keyboard.notify_keyval(GLib.get_monotonic_time(), character.charCodeAt(0), Clutter.KeyState.PRESSED);
      keyboard.notify_keyval(GLib.get_monotonic_time(), character.charCodeAt(0), Clutter.KeyState.RELEASED);
    }
  };
  const documentPath = GLib.build_filenamev([GLib.get_user_cache_dir(), 'print-check.pdf']);
  writeDocument(documentPath);

  const prepared = call('Print', 'PreparePrint', new GLib.Variant('(osssa{sv}a{sv}a{sv})', [requestHandle(), APP, '', 'Print', {
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
  await pause(700);
  let dialog = portalDialog();
  require(['Copies', 'Pages', 'Paper', 'Orientation', 'Two-sided', 'Color'].every(label => field(dialog, label)) && labelled(dialog, 'Office Printer'),
    'the print dialog offers the printer and its options');
  await capture(`${output}/portal-print.png`);

  await click(labelled(dialog, 'More copies'));
  await click(labelled(dialog, 'Range'));
  const accept = labelled(dialog, 'Print');
  require(!accept.reactive, 'an empty page range cannot be printed');
  type('2-3');
  await pause(150);
  require(accept.reactive, 'a page range can be typed');
  await click(labelled(dialog, 'Landscape'));
  await click(labelled(dialog, 'Long edge'));
  await click(labelled(dialog, 'Black & white'));
  await click(labelled(dialog, 'A4'));
  require(labelled(dialog, 'Letter') && labelled(dialog, 'A5'), 'the paper list shows what the printer takes');
  await click(labelled(dialog, 'A5'));

  await click(labelled(dialog, 'Office Printer'));
  await click(labelled(dialog, 'Label Printer'));
  require(!field(dialog, 'Two-sided') && !field(dialog, 'Color') && labelled(dialog, 'A5'), 'options follow what the chosen printer can do');
  await click(labelled(dialog, 'Label Printer'));
  await click(labelled(dialog, 'Office Printer'));
  dialog = portalDialog();
  await click(labelled(dialog, 'Print'));

  const [response, {settings, 'page-setup': pageSetup, token}] = (await prepared).recursiveUnpack();
  require(response === 0 && settings.printer === PRINTER && settings['n-copies'] === '2' && settings['print-pages'] === 'ranges'
    && settings['page-ranges'] === '1-2' && settings.duplex === 'vertical' && settings['use-color'] === 'false'
    && settings['output-file-format'] === 'pdf' && !('output-uri' in settings), 'apps get the chosen print settings');
  require(pageSetup.Name === 'iso_a5_148x210mm' && pageSetup.Width === 148 && pageSetup.Height === 210 && pageSetup.Orientation === 'landscape'
    && pageSetup.MarginTop === 6.35, 'apps get the chosen paper and orientation');

  const before = await completedJobs();
  const [printed] = await printDocument(APP, documentPath, {token: new GLib.Variant('u', token)});
  require(printed === 0 && await jobFinished(pause, before), 'the prepared document is printed without asking again');

  const reused = printDocument(APP, documentPath, {token: new GLib.Variant('u', token)});
  await pause(700);
  dialog = portalDialog();
  require(dialog && !field(dialog, 'Orientation') && field(dialog, 'Pages'), 'a used token asks again, without layout options');
  await capture(`${output}/portal-print-document.png`);
  await click(labelled(dialog, 'Cancel'));
  require((await reused)[0] === 1, 'cancelling the print dialog prints nothing');

  const direct = printDocument(APP, documentPath, {});
  await pause(700);
  const counted = await completedJobs();
  await click(labelled(portalDialog(), 'Print'));
  require((await direct)[0] === 0 && await jobFinished(pause, counted), 'apps can print a document directly');
  Gio.File.new_for_path(documentPath).delete(null);
}
