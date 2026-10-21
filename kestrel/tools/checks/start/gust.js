import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {formatsLocale} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {centerOf, chord, click, press, rest} from '../lib/input/input.js';
import {gjs, stopAll, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {nextFrame, settled} from '../lib/wait.js';
import {bestTitle, closeStart, descriptionOf, row, rows, search, titleOf} from './search/results.js';

const {require, eventually} = checks('Gust');
const shell = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const keybindings = new Gio.Settings({schema_id: 'com.lantharos.kestrel.keybindings'});
const RATES = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'currency-rates.json']);
const NOTES = GLib.build_filenamev([GLib.get_home_dir(), 'Documents', 'Gust check', 'Lighthouse notes.txt']);
const WINDOW = 'Harbor timetable';
const COPIED = 'the ferry leaves at seven sharp';

const palette = () => named('kestrel-palette');
const entry = () => palette().get_first_child();
const preview = () => named('kestrel-palette-preview');
const clipboard = () => new Promise(resolve => St.Clipboard.get_default().get_text(St.ClipboardType.CLIPBOARD, (_, text) => resolve(text)));
const highlighted = () => rows().find(actor => actor.child.get_first_child().visible) ?? null;
const keyed = prefix => rows().find(actor => actor.name.startsWith(`kestrel-search-${prefix}`)) ?? null;
const fullDate = (year, month, day) => new Intl.DateTimeFormat(formatsLocale(), {dateStyle: 'full', timeZone: 'UTC'}).format(Date.UTC(year, month - 1, day));
const indexed = async name => (await call('com.lantharos.Search', '/com/lantharos/Search', 'com.lantharos.Search', 'Find',
  new GLib.Variant('(su)', [name, 10]), '(a(sbd))')).deepUnpack()[0].some(([path]) => path === NOTES);

async function openWithSuper() {
  closeStart();
  await settled();
  let painted = null;
  const signal = global.stage.connect_after('after-paint', () => {
    painted ??= {mapped: !!palette()?.mapped, focused: !!palette()?.contains(global.stage.get_key_focus())};
  });
  global.display.emit('overlay-key');
  await nextFrame();
  global.stage.disconnect(signal);
  require(painted?.mapped, 'Gust is on screen in the first frame after Super');
  require(painted?.focused, 'its search field has the keyboard from the first frame');
  await eventually(() => shown(palette()), 'Super opens Gust');
  await settled();
}

async function checkOpening() {
  shell.set_string('start-style', 'palette');
  await eventually(() => !named('kestrel-start'), 'choosing Gust replaces the Start menu');
  await openWithSuper();
  await capture('gust');
  press(Clutter.KEY_Escape);
  await eventually(() => !shown(palette()), 'Escape closes Gust');

  const launcher = named('Start', named('kestrel-panel'));
  click(centerOf(launcher));
  await eventually(() => shown(palette()), 'the Start button opens Gust');
  rest();
  closeStart();

  keybindings.set_strv('toggle-start', ['<Super>F9']);
  await settled();
  await chord(Clutter.KEY_Super_L, Clutter.KEY_F9);
  await eventually(() => shown(palette()), 'the Open Start shortcut opens Gust');
  keybindings.reset('toggle-start');
  closeStart();
}

async function checkResults() {
  St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, COPIED);
  await openWithSuper();
  search('settings');
  await eventually(() => keyed('app:'), 'apps are found');
  search('private window');
  await eventually(() => row('command:helium.desktop:new-private-window'), 'an app action from its desktop file is found');
  search(WINDOW.toLowerCase());
  await eventually(() => keyed('window:'), 'open windows are found by title');
  await eventually(() => shown(preview()), 'a window shows a preview');
  await capture('gust-windows');
  search('fonts');
  await eventually(() => row('setting:appearance/fonts'), 'Settings pages are found');
  search('dark mode');
  await eventually(() => row('action:dark-style'), 'system actions are found');
  search('2*(3+18)');
  await eventually(() => bestTitle() === '= 42', 'calculations come first');
  search('100 usd in eur');
  const euros = new Intl.NumberFormat(formatsLocale(), {style: 'currency', currency: 'EUR'}).format(80);
  await eventually(() => bestTitle() === `= ${euros}`, 'currencies convert with the saved rates');
  search('ferry leaves');
  await eventually(() => row('clipboard:0') && titleOf(row('clipboard:0')) === COPIED, 'clipboard history is searched');
  search('grinning face');
  await eventually(() => keyed('emoji:'), 'emoji are found');
  await eventually(() => shown(preview()), 'an emoji shows a large preview');
  await eventually(() => indexed('lighthouse'), 'the file index finds a new file', 20000);
  search('lighthouse notes');
  await eventually(() => keyed('file:'), 'files are found by name', 20000);
  search('breakwater seagulls');
  await eventually(() => keyed('file:'), 'files are found by what they say', 20000);
  search('qwzx plover');
  await eventually(() => bestTitle() === 'Search the web for “qwzx plover”', 'the web search comes up when nothing else matches');
}

async function checkKeyboard() {
  search('helium');
  await eventually(() => rows().length > 2, 'several results show');
  await eventually(() => highlighted() === rows()[0], 'the best match is highlighted');
  press(Clutter.KEY_Down);
  await eventually(() => highlighted() === rows()[1], 'Down highlights the next result');
  require(entry().clutter_text.has_key_focus(), 'arrow keys leave the keyboard in the search field');
  press(Clutter.KEY_Up);
  await eventually(() => highlighted() === rows()[0], 'Up goes back');
}

const ANSWERS = [
  ['days between 1 may 2026 and 1 sep 2026', '123 days'],
  ['weeks between 1 may 2026 and 1 sep 2026', '17 weeks, 4 days'],
  ['what day is 14 feb 2027', fullDate(2027, 2, 14)],
  ['25% of 340', '= 85'],
  ['17 is what percent of 340', '= 5%'],
];

async function checkAnswers() {
  for (const [question, title] of ANSWERS) {
    search(question);
    await eventually(() => bestTitle() === title, `${question} answers ${title}`);
  }
  search('time in tokyo');
  await eventually(() => row('answer') && descriptionOf(row('answer')).startsWith('Tokyo, '), 'time in tokyo answers with the time there');
  search('10pm london in new york');
  await eventually(() => row('answer') && descriptionOf(row('answer')).startsWith('In New York when'), 'a time converts between cities');
  await capture('gust-answers');
  search(ANSWERS[1][0]);
  await eventually(() => bestTitle() === ANSWERS[1][1], 'the answer is back');
  press(Clutter.KEY_Return);
  await eventually(async () => await clipboard() === ANSWERS[1][1], 'Enter copies the answer');
}

export async function run() {
  GLib.mkdir_with_parents(GLib.path_get_dirname(RATES), 0o755);
  GLib.file_set_contents(RATES, JSON.stringify({date: '2026-10-21', eur: {usd: 1.25, gbp: 0.85, jpy: 160}}));
  GLib.mkdir_with_parents(GLib.path_get_dirname(NOTES), 0o755);
  GLib.file_set_contents(NOTES, 'Seagulls circle the breakwater every morning.\n');
  gjs('clients/windows/boardWindow.js', [WINDOW, '640', '420']);
  try {
    await waitForWindow(WINDOW);
    await checkOpening();
    await checkResults();
    await checkKeyboard();
    await checkAnswers();
  } finally {
    closeStart();
    shell.reset('start-style');
    keybindings.reset('toggle-start');
    await stopAll();
    GLib.unlink(NOTES);
    GLib.unlink(RATES);
  }
}
