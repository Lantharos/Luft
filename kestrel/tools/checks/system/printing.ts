import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {existing, named, shown, showsText, styled} from '../lib/actors.js';
import {writeDocument} from '../lib/access/printing.js';
import {checks} from '../lib/check.js';
import {click, rest} from '../lib/input/input.js';
import {fixture, outcome, scratch} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';

const {require, eventually} = checks('printing');
const PRINTER = 'Studio';
const DOCUMENT = scratch('printing-report.pdf');
const DONE_FOR = 3000;
const JOB_TIMEOUT = 10000;
const SCHEMES = [['dark', 'prefer-dark'], ['light', 'default']] as const;
const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});

const panel = () => named('kestrel-print-panel');
const panelShown = () => {
  const actor = panel();
  return shown(actor) && actor.opacity === 255 && actor.translation_y === 0;
};
const indicator = () => existing('kestrel-taskbar-printing');
const rows = () => styled('kestrel-print-row', panel()!).filter(row => row.mapped);

let said = 0;

async function captureSchemes(name: string) {
  const saved = interfaceSettings.get_string('color-scheme');
  try {
    for (const [scheme, colorScheme] of SCHEMES) {
      interfaceSettings.set_string('color-scheme', colorScheme);
      await settled();
      await capture(`${name}-${scheme}`);
    }
  } finally {
    interfaceSettings.set_string('color-scheme', saved);
  }
}

async function control() {
  const {stdout} = await outcome(['lpstat', '-v', PRINTER]);
  return stdout.slice(stdout.indexOf('slow:') + 'slow:'.length);
}

async function tell(line: string) {
  const folder = await control();
  GLib.file_set_contents(`${folder}/say.${++said}`, `${line}\n`);
}

async function end(how: 'finish' | 'fail') {
  GLib.file_set_contents(`${await control()}/${how}`, '');
}

async function jobs() {
  const {stdout} = await outcome(['lpstat', '-o', PRINTER]);
  return stdout.split('\n').filter(Boolean).length;
}

async function print(title: string, pages: number) {
  const {ok} = await outcome(['python3', fixture('session', 'printJob.py'), PRINTER, title, `${pages}`, DOCUMENT]);
  require(ok, `“${title}” goes to the printer`);
}

async function printing() {
  await print('Quarterly report', 5);
  await eventually(panelShown, 'the panel slides up when a document starts printing');
  await print('Shipping list', 2);
  await eventually(() => rows().length === 1, 'the second document waits in the queue below');
  await tell('PAGE: 1 1');
  await tell('PAGE: 2 1');
  await eventually(() => showsText('2 of 5 pages', panel()!), 'the panel counts the pages that came out');
  await eventually(() => showsText('Color', panel()!) && showsText('80%', panel()!), 'the panel shows the printer’s ink');
  require(shown(indicator()), 'the taskbar shows the printer while documents print');
  await captureSchemes('printing-panel');
}

async function warning() {
  await tell('STATE: +media-empty-error');
  await tell('ATTR: marker-levels=80,8');
  await tell('STATE: +marker-supply-low-warning');
  await eventually(() => showsText('Out of paper', panel()!) && showsText('8%', panel()!), 'the panel warns when the printer runs out of paper');
  await captureSchemes('printing-panel-warning');
  await tell('STATE: -media-empty-error');
  await tell('STATE: -marker-supply-low-warning');
  await tell('ATTR: marker-levels=80,60');
  await eventually(() => !showsText('Out of paper', panel()!), 'the warning goes once there is paper again');
}

async function cancelQueued() {
  const before = await jobs();
  click(rows()[0].get_children().find(child => child instanceof St.Button)!);
  await eventually(async () => await jobs() === before - 1, 'canceling a waiting document takes it off the printer', JOB_TIMEOUT);
  await eventually(() => rows().length === 0, 'the canceled document leaves the panel');
}

async function closeAndReopen() {
  click(existing('kestrel-print-close', panel()!));
  await eventually(() => !shown(panel()), 'closing the panel hides it while printing goes on');
  require(shown(indicator()), 'the printer stays in the taskbar after the panel is closed');
  click(indicator());
  await eventually(panelShown, 'clicking the printer in the taskbar brings the panel back');
  rest();
}

async function finishing() {
  await end('finish');
  await eventually(() => showsText('Printed on Studio Printer', panel()!), 'the panel says when the last document has printed', JOB_TIMEOUT);
  await eventually(() => !shown(panel()), 'the panel closes by itself after the last document', DONE_FOR + JOB_TIMEOUT);
  await eventually(() => !shown(indicator()), 'the printer leaves the taskbar once nothing prints');
}

async function failing() {
  await print('Boarding pass', 1);
  await eventually(panelShown, 'the panel comes back for the next document');
  await end('fail');
  await eventually(() => showsText('Couldn’t print on Studio Printer', panel()!), 'the panel says when a document couldn’t print', JOB_TIMEOUT);
  await pause(DONE_FOR * 2);
  require(shown(panel()), 'a document that couldn’t print stays in the panel until it is closed');
  await captureSchemes('printing-panel-failed');
  click(existing('kestrel-print-close', panel()!));
  await eventually(() => !shown(panel()) && !shown(indicator()), 'closing the panel lets go of the failed document');
}

export async function run() {
  writeDocument(DOCUMENT);
  await printing();
  await warning();
  await cancelQueued();
  await closeAndReopen();
  await finishing();
  await failing();
}
