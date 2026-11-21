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

async function checkOpening(gust: Clutter.Actor) {
  const entry = ofType(gust.get_first_child(), St.Entry);
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

async function checkGrid(gust: Clutter.Actor) {
  const items = shownItems(gust);
  const names = items.map(item => item.accessible_name);
  require(names.every((name, index) => !index || names[index - 1].localeCompare(name) <= 0), 'Gust lists apps from A to Z');
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const pinned = settings.get_strv('favorite-apps');
  require(pinned.length && items.every(item => !pinned.includes(idOf(item))), 'Gust leaves out apps pinned to the taskbar');

  const kindOf = (item: St.Button) => Shell.AppSystem.get_default().lookup_app(idOf(item))?.app_info.get_generic_name();
  const described = require(items.find(item => kindOf(item) && kindOf(item) !== item.accessible_name), 'Gust lists an app with a generic name');
  moveTo(centerOf(described));
  const hint = await eventually(() => styled('kestrel-gust-hint').find(label => label.visible && (label as St.Label).text === kindOf(described)),
    'resting on an app in Gust says what kind of app it is');
  await settled();
  await capture('gust-panel-app-hint');
  rest();
  await eventually(() => !hint.visible, 'the hint goes away with the pointer');
}

async function checkPinning(gust: Clutter.Actor) {
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const saved = settings.get_strv('favorite-apps');
  const item = shownItems(gust)[0];
  const id = idOf(item);
  rightClick(item);
  const menu = named('kestrel-context-menu')!;
  await eventually(() => menu.visible, 'right-clicking an app in Gust opens its menu');
  click(existing('Pin to taskbar', menu));
  await eventually(() => saved.length < settings.get_strv('favorite-apps').length, 'Pin to taskbar pins the app');
  await eventually(() => !shownItems(gust).some(shown => idOf(shown) === id), 'pinning an app takes it out of Gust');
  await settled();
  await capture('gust-panel-pinned');

  settings.set_strv('favorite-apps', saved);
  await eventually(() => shownItems(gust).some(shown => idOf(shown) === id), 'unpinning an app brings it back to Gust');
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
  await checkPinning(gust);
  const search = await checkCaret();
  await checkHover(gust);
  global.stage.set_key_focus(search);
  await checkContextMenu(gust);
}
