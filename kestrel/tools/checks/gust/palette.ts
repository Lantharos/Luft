import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {formatsLocale} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {named, ofType, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {centerOf, chord, click, press, rest} from '../lib/input/input.js';
import {gjs, stopAll, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {nextFrame, settled} from '../lib/wait.js';
import {bestTitle, closeGust, descriptionOf, row, rows, search, titleOf} from './search/results.js';

const {require, eventually} = checks('Gust palette');
const shell = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const keybindings = new Gio.Settings({schema_id: 'com.lantharos.kestrel.keybindings'});
const RATES = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'currency-rates.json']);
const WINDOW = 'Harbor timetable';
const COPIED = 'the ferry leaves at seven sharp';

const palette = () => named('kestrel-gust-palette');
const entry = () => ofType(palette()!.get_first_child(), St.Entry);
const preview = () => named('kestrel-gust-palette-preview');
const clipboard = () => new Promise<string | null>(resolve => St.Clipboard.get_default().get_text(St.ClipboardType.CLIPBOARD, (_, text) => resolve(text)));
const sheet = () => named('kestrel-gust-sheet', palette()!)!;
const cells = () => sheet().get_children().filter((actor): actor is St.Button => actor instanceof St.Button && actor.visible);
const highlightedCell = () => cells().find(cell => cell.has_style_pseudo_class('highlighted')) ?? null;
const chip = (category: string) => ofType(named(`kestrel-gust-chip-${category}`, palette()!), St.Button);
const listShown = () => shown(named('kestrel-search-results', palette()!));
const highlighted = () => rows().find(actor => actor.child!.get_first_child()!.visible) ?? null;
const keyed = (prefix: string) => rows().find(actor => actor.name?.startsWith(`kestrel-search-${prefix}`)) ?? null;
const fullDate = (year: number, month: number, day: number) => new Intl.DateTimeFormat(formatsLocale(), {dateStyle: 'full', timeZone: 'UTC'}).format(Date.UTC(year, month - 1, day));

async function openWithSuper() {
  closeGust();
  await settled();
  const first: {painted: {mapped: boolean; focused: boolean} | null} = {painted: null};
  const signal = global.stage.connect_after('after-paint', () => {
    first.painted ??= {mapped: !!palette()?.mapped, focused: !!palette()?.contains(global.stage.get_key_focus()!)};
  });
  global.display.emit('overlay-key');
  await nextFrame();
  global.stage.disconnect(signal);
  require(first.painted?.mapped, 'Gust is on screen in the first frame after Super');
  require(first.painted?.focused, 'its search field has the keyboard from the first frame');
  await eventually(() => shown(palette()), 'Super opens Gust');
  await settled();
}

async function checkOpening() {
  shell.set_string('gust-look', 'palette');
  await eventually(() => !named('kestrel-gust-panel'), 'choosing the palette look replaces the panel');
  await openWithSuper();
  await eventually(() => shown(sheet()) && cells().length > 8 && !listShown(), 'with nothing typed, Gust shows every app');
  await capture('gust-palette');
  press(Clutter.KEY_Escape);
  await eventually(() => !shown(palette()), 'Escape closes Gust');

  const button = named('Gust', named('kestrel-panel')!)!;
  click(centerOf(button));
  await eventually(() => shown(palette()), 'the Gust button opens Gust');
  rest();
  closeGust();

  keybindings.set_strv('toggle-gust', ['<Super>F9']);
  await settled();
  await chord(Clutter.KEY_Super_L, Clutter.KEY_F9);
  await eventually(() => shown(palette()), 'the Open Gust shortcut opens Gust');
  keybindings.reset('toggle-gust');
  closeGust();
}

const iconOf = (cell: St.Button) => cell.child!.get_first_child()!;
const edges = (actor: Clutter.Actor) => {
  const [x] = actor.get_transformed_position();
  return [x, x + actor.get_transformed_size()[0]];
};

function checkAlignment() {
  const [rowLeft, rowRight] = edges(named('kestrel-gust-chips', palette()!)!.get_parent()!);
  const edge = edges(chip('all'))[0];
  const firstRow = cells().filter(cell => cell.get_allocation_box().y1 === cells()[0].get_allocation_box().y1);
  require(Math.abs(edges(iconOf(firstRow[0]))[0] - edge) < 0.01, 'the first column of apps lines up with All');
  const full = cells().length > firstRow.length;
  require(!full || Math.abs(edges(iconOf(firstRow.at(-1)!))[1] - (rowRight - (edge - rowLeft))) < 0.01, 'a full row of apps ends as far in as All starts');
}

async function checkGrid() {
  await openWithSuper();
  const total = cells().length;
  const names = cells().map(cell => cell.accessible_name);
  require(names.every((name, index) => !index || names[index - 1].localeCompare(name) <= 0), 'the apps go from A to Z');
  require(chip('all').checked, 'All is chosen');
  checkAlignment();
  require(!highlightedCell(), 'nothing is highlighted before a key is pressed');
  press(Clutter.KEY_Right);
  await eventually(() => highlightedCell() === cells()[0], 'an arrow key highlights the first app');
  press(Clutter.KEY_Right);
  await eventually(() => highlightedCell() === cells()[1], 'Right highlights the next app');
  press(Clutter.KEY_Down);
  await eventually(() => cells().indexOf(highlightedCell()!) > 2, 'Down highlights the app below');
  require(entry().clutter_text.has_key_focus(), 'arrow keys leave the keyboard in the search field');

  press(Clutter.KEY_Tab);
  await eventually(() => global.stage.get_key_focus() === chip('all'), 'Tab moves to the categories');
  press(Clutter.KEY_Right);
  await eventually(() => chip('open').checked && listShown() && !shown(sheet()) && keyed('window:') && shown(preview()), 'Open, right after All, lists the open windows with a preview');
  await settled();
  const rowIcon = rows()[0].child!.get_last_child()!.get_first_child()!;
  require(Math.abs(edges(rowIcon)[0] - edges(chip('all'))[0]) < 0.01, 'the open windows line up with All');
  await capture('gust-palette-open');
  press(Clutter.KEY_Right);
  const chosen = await eventually(() => chip('open').checked ? null : global.stage.get_key_focus() as St.Button, 'Right chooses the next category');
  require(chosen.checked && shown(sheet()), 'the focused category is chosen');
  await eventually(() => cells().length > 0 && cells().length < total, 'a category shows only its apps');
  await settled();
  checkAlignment();
  press(Clutter.KEY_Tab);
  await eventually(() => entry().clutter_text.has_key_focus(), 'Tab goes back to the search field');
  press(Clutter.KEY_Escape);
  await eventually(() => chip('all').checked && cells().length === total && shown(palette()), 'Escape goes back to every app');

  click(centerOf(chip('open')));
  await eventually(() => chip('open').checked && listShown(), 'clicking Open lists the open windows');
  rest();
  press(Clutter.KEY_Return);
  await eventually(() => !shown(palette()) && global.display.focus_window?.get_title() === WINDOW, 'Enter switches to the highlighted window');
  await openWithSuper();

  search('terminal');
  await eventually(() => cells()[0]?.name === 'kestrel-gust-app-com.lantharos.terminal.desktop' && highlightedCell() === cells()[0] && !listShown(),
    'typing an app name filters the apps and highlights the best match');
  search('dark mode');
  await eventually(() => listShown() && !shown(sheet()) && row('action:dark-style'), 'a query that is more than an app shows results');
  await settled();
  await capture('gust-palette-results');
  search('');
  await eventually(() => shown(sheet()) && cells().length === total, 'clearing the search shows every app again');
}

async function checkResults() {
  St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, COPIED);
  await openWithSuper();
  search('settings');
  await eventually(() => named('kestrel-gust-app-com.lantharos.settings.desktop', sheet())?.mapped, 'apps are found');
  search('private window');
  await eventually(() => row('command:net.imput.helium.desktop:new-private-window'), 'an app action from its desktop file is found');
  search(WINDOW.toLowerCase());
  await eventually(() => keyed('window:'), 'open windows are found by title');
  await eventually(() => shown(preview()), 'a window shows a preview');
  search('100 usd in eur');
  const euros = new Intl.NumberFormat(formatsLocale(), {style: 'currency', currency: 'EUR'}).format(80);
  await eventually(() => bestTitle() === `= ${euros}`, 'currencies convert with the saved rates');
  search('ferry leaves');
  await eventually(() => row('clipboard:0') && titleOf(row('clipboard:0')!) === COPIED, 'clipboard history is searched');
  search('grinning face');
  await eventually(() => keyed('emoji:'), 'emoji are found');
  await eventually(() => shown(preview()), 'an emoji shows a large preview');
  search('qwzx plover');
  await eventually(() => bestTitle() === 'Search the web for “qwzx plover”', 'the web search comes up when nothing else matches');
}

async function checkKeyboard() {
  search('dark');
  await eventually(() => listShown() && rows().length > 2, 'several results show');
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
  await eventually(() => row('answer') && descriptionOf(row('answer')!).startsWith('Tokyo, '), 'time in tokyo answers with the time there');
  search('10pm london in new york');
  await eventually(() => row('answer') && descriptionOf(row('answer')!).startsWith('In New York when'), 'a time converts between cities');
  await capture('gust-answers');
  search(ANSWERS[1][0]);
  await eventually(() => bestTitle() === ANSWERS[1][1], 'the answer is back');
  press(Clutter.KEY_Return);
  await eventually(async () => await clipboard() === ANSWERS[1][1], 'Enter copies the answer');
}

export async function run() {
  GLib.mkdir_with_parents(GLib.path_get_dirname(RATES), 0o755);
  GLib.file_set_contents(RATES, JSON.stringify({date: '2026-10-21', eur: {usd: 1.25, gbp: 0.85, jpy: 160}}));
  gjs('clients/windows/boardWindow.js', [WINDOW, '640', '420']);
  try {
    await waitForWindow(WINDOW);
    await checkOpening();
    await checkGrid();
    await checkResults();
    await checkKeyboard();
    await checkAnswers();
  } finally {
    closeGust();
    shell.reset('gust-look');
    keybindings.reset('toggle-gust');
    await stopAll();
    GLib.unlink(RATES);
  }
}
