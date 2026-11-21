import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import St from 'gi://St';

import {descendants, existing, named, ofType, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {centerOf, click, moveTo, press, rest, rightClick, type} from '../lib/input/input.js';
import {capture, captureRenderedFrames} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';

const {require, eventually} = checks('Gust panel');
const HOVERED = [[70, 160], [172, 250], [274, 340], [376, 160], [478, 250]];
const IDLE_SAMPLE = 1000;
const IDLE_FRAMES = 2;

async function countFrames(milliseconds: number) {
  let frames = 0;
  const signal = global.stage.connect('after-paint', () => frames++);
  await pause(milliseconds);
  global.stage.disconnect(signal);
  return frames;
}

const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const pins = (): string[] => JSON.parse(settings.get_string('gust-layout')).items;
const installed = (id: string) => !!Shell.AppSystem.get_default().lookup_app(id);

async function checkOpening(gust: Clutter.Actor) {
  const entry = ofType(descendants(gust).find(actor => actor instanceof St.Entry) ?? null, St.Entry);
  const hintPositions = new Set<number>();
  const hintSignal = global.stage.connect('after-paint', () => {
    if (entry.mapped) hintPositions.add(entry.get_hint_actor()!.x);
  });
  global.display.emit('overlay-key');
  await eventually(() => gust.visible, 'Super opens Gust');
  await settled();
  global.stage.disconnect(hintSignal);
  require(hintPositions.size === 1, 'the search placeholder stays put while Gust opens');
  await capture('gust-panel');

  const button = ofType(named('Gust', named('kestrel-panel')!), St.Widget);
  const [buttonX, buttonY] = button.get_transformed_position();
  moveTo([buttonX + 20, buttonY + 20]);
  await eventually(() => button.hover, 'the Gust button reacts to the pointer');
  await capture('gust-button-hover');
  rest();
}

const ITEM = 'kestrel-gust-item-';
const shownItems = (gust: Clutter.Actor) => descendants(gust).filter(actor => actor.name?.startsWith(ITEM) && actor.mapped) as St.Button[];
const idOf = (item: St.Button) => item.name!.slice(ITEM.length);

const allApps = (gust: Clutter.Actor) => existing('kestrel-gust-all-apps', gust);
const listed = (gust: Clutter.Actor) => allApps(gust).get_children().filter((actor): actor is St.Button => actor instanceof St.Button && actor.visible);
const listedId = (row: St.Button) => row.name!.slice('kestrel-search-app:'.length);

async function checkGrid(gust: Clutter.Actor) {
  const items = shownItems(gust);
  require(items.map(idOf).join() === pins().filter(installed).join(), 'Gust shows the apps pinned to it, in their order');

  const kindOf = (item: St.Button) => Shell.AppSystem.get_default().lookup_app(idOf(item))?.app_info.get_generic_name();
  const described = require(items.find(item => kindOf(item) && kindOf(item) !== item.accessible_name), 'Gust pins an app with a generic name');
  moveTo(centerOf(described));
  const hint = await eventually(() => styled('kestrel-gust-hint').find(label => label.visible && (label as St.Label).text === kindOf(described)),
    'resting on an app in Gust says what kind of app it is');
  await settled();
  await capture('gust-panel-app-hint');
  rest();
  await eventually(() => !hint.visible, 'the hint goes away with the pointer');
}

async function chooseFromMenu(actor: Clutter.Actor, label: string) {
  rightClick(actor);
  const menu = named('kestrel-context-menu')!;
  await eventually(() => menu.visible, `right-clicking ${actor.accessible_name} opens its menu`);
  click(existing(label, menu));
  await eventually(() => !menu.visible, `${label} closes the menu`);
}

async function checkAllApps(gust: Clutter.Actor) {
  const toggle = existing('kestrel-gust-view', gust);
  press(Clutter.KEY_Tab);
  await eventually(() => global.stage.get_key_focus() === toggle, 'Tab moves from the search field to the All apps button');
  press(Clutter.KEY_Return);
  await eventually(() => allApps(gust).mapped && !shownItems(gust).length, 'the All apps button lists every app');
  const names = listed(gust).map(row => row.accessible_name);
  require(names.length > pins().length && names.every((name, index) => !index || names[index - 1].localeCompare(name) <= 0), 'All apps lists every app from A to Z');
  await settled();
  await capture('gust-panel-all-apps');

  const row = require(listed(gust).find(candidate => !pins().includes(listedId(candidate))), 'All apps lists an app that is not pinned');
  const id = listedId(row);
  await chooseFromMenu(row, 'Pin to Gust');
  require(pins().at(-1) === id, 'Pin to Gust pins the app at the end');
  press(Clutter.KEY_Escape);
  await eventually(() => !allApps(gust).mapped && shownItems(gust).some(item => idOf(item) === id), 'Escape goes back to the pinned apps, with the new one');
  await chooseFromMenu(shownItems(gust).find(item => idOf(item) === id)!, 'Unpin from Gust');
  await eventually(() => !pins().includes(id) && !shownItems(gust).some(item => idOf(item) === id), 'Unpin from Gust takes it away');

  const saved = settings.get_string('gust-layout');
  settings.set_string('gust-layout', '{"items":[],"folders":{}}');
  await eventually(() => named('kestrel-gust-no-pins', gust)?.mapped && !shownItems(gust).length, 'with nothing pinned, Gust says so');
  await settled();
  await capture('gust-panel-empty');
  settings.set_string('gust-layout', saved);
  await eventually(() => shownItems(gust).length && !named('kestrel-gust-no-pins', gust)?.mapped, 'the pins come back');
}

async function checkCaret() {
  const search = ofType(global.stage.get_key_focus(), Clutter.Text);
  await eventually(() => search.cursor_visible === false, 'the search caret blinks', 2000);
  return search;
}

async function checkHover(gust: Clutter.Actor) {
  global.stage.set_key_focus(null);
  await captureRenderedFrames('gust-panel-hover', async () => {
    for (const [x, y] of HOVERED) {
      moveTo([gust.x + x, gust.y + y]);
      await settled();
    }
    rest();
    await settled();
  });
  require(await countFrames(IDLE_SAMPLE) <= IDLE_FRAMES, 'Gust stops repainting once the pointer rests');
}

async function checkContextMenu(gust: Clutter.Actor) {
  type('files');
  await eventually(() => named('Rover', gust)?.mapped, 'searching finds pinned Rover');
  await capture('search');

  rightClick(named('Rover', gust)!);
  const menu = named('kestrel-context-menu')!;
  await eventually(() => menu.visible, 'right-clicking an app opens its menu');
  require(named('Unpin from Gust', menu), 'a search result can be unpinned from Gust');
  const secondAction = styled('kestrel-context-action', menu)[1];
  const [actionX, actionY] = secondAction.get_transformed_position();
  moveTo([actionX + 20, actionY + secondAction.height / 2]);
  await eventually(() => global.stage.get_key_focus() === secondAction, 'menu focus follows the pointer');
  await capture('app-context-menu');
  press(Clutter.KEY_Escape);
  await eventually(() => !menu.visible && gust.visible, 'Escape closes the menu and keeps Gust open');
  press(Clutter.KEY_Menu);
  await eventually(() => menu.visible, 'the Menu key opens the app menu');
  press(Clutter.KEY_Escape);
  await eventually(() => !menu.visible, 'Escape closes the keyboard menu');
}

export async function run() {
  await capture('panel');
  const gust = named('kestrel-gust-panel')!;
  await checkOpening(gust);
  await checkGrid(gust);
  const search = await checkCaret();
  await checkAllApps(gust);
  await checkHover(gust);
  global.stage.set_key_focus(search);
  await checkContextMenu(gust);
}
