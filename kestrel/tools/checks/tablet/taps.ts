import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import St from 'gi://St';

import {descendants, named, ofType} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {centerOf, moveTo, type Point} from '../lib/input/input.js';
import {gjs, stop, waitForWindow, waitForWindows} from '../lib/processes.js';
import {pause, settled, waitUntil} from '../lib/wait.js';
import {clicksOf, inside, middle, monitor, pressesStayWith} from './lib/presses.js';
import {fold, tap, touchDown, touchMove, touchUp} from './lib/touch.js';

const {require, eventually} = checks('taps');
const LONGER_THAN_A_TAP = 400;
const RESTING_FINGER = 150;

const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const panel = () => ofType(named('kestrel-panel'), St.Widget);
const islands = () => panel().get_children().filter(child => child.name?.startsWith('kestrel-island-'));
const appButtons = () => descendants(panel()).filter((actor): actor is St.Button => actor instanceof St.Button && !!actor.name?.startsWith('kestrel-app-'));

function staleHover() {
  const tracking = descendants(panel()).filter((actor): actor is St.Widget => actor instanceof St.Widget && actor.track_hover);
  for (const widget of tracking) widget.sync_hover();
  return tracking.filter(widget => widget.hover).map(widget => widget.name ?? widget.style_class);
}

async function requireNoHoverLeft(label: string) {
  await settled();
  const hovered = staleHover();
  require(!hovered.length, `${label} leaves nothing on the taskbar hovered (${hovered.join(', ') || 'none'})`);
}

async function touchesOnTheTaskbar() {
  moveTo(middle());
  const start = centerOf(appButtons()[0]);
  touchDown(start);
  await pause(RESTING_FINGER);
  await touchMove(start, middle(), 10);
  touchUp();
  await requireNoHoverLeft('dragging a finger from an app button onto the desktop');
  require(appButtons().every(shown => !shown.pressed && !shown.has_style_pseudo_class('active')),
    'no app button stays pressed after the finger leaves it');

  await fold(true);
  await settled();
  const [x] = middle();
  const edge: Point = [x, monitor().y + monitor().height - 2];
  touchDown(edge);
  await touchMove(edge, [x, edge[1] - 110], 8);
  touchUp();
  await requireNoHoverLeft('swiping the tablet taskbar open');
  await fold(false);
  await requireNoHoverLeft('folding back into a laptop');
}

async function taskbarFollowsAfterTouch() {
  const before = appButtons().length;
  const app = gjs('clients/windows/window.js');
  try {
    await waitForWindow('Kestrel window check');
    await eventually(() => appButtons().length > before, 'an app opened after touching the taskbar gets its button');
    settings.set_string('taskbar-auto-hide', 'always');
    await eventually(() => !panel().visible || islands().every(island => !island.visible), 'the taskbar hides itself after it was touched');
  } finally {
    settings.reset('taskbar-auto-hide');
    await stop(app);
  }
}

async function tapsReachTheirWindow() {
  const [first, second] = await waitForWindows(['Kestrel window check 1', 'Kestrel window check 2']);
  first.move_resize_frame(false, monitor().x + 60, monitor().y + 60, 640, 420);
  second.move_resize_frame(false, monitor().x + 420, monitor().y + 240, 640, 420);
  second.activate(global.get_current_time());
  await waitUntil(() => global.display.focus_window === second, 'the second window has focus');
  await settled();

  await tap(inside(first, [120, 160]));
  await eventually(() => clicksOf(first) === 1, 'tapping the window behind delivers the tap to it');
  await eventually(() => global.display.focus_window === first && global.display.sort_windows_by_stacking([first, second])[1] === first,
    'tapping the window behind focuses it and brings it forward');

  await tap(inside(first, [200, 200]));
  await eventually(() => clicksOf(first) === 2, 'tapping the focused window delivers the tap to it');
  await pause(LONGER_THAN_A_TAP);
  require(global.display.focus_window === first && clicksOf(second) === 0, 'tapping the focused window keeps focus on it');

  await tap(inside(second, [560, 360]));
  await eventually(() => clicksOf(second) === 1 && global.display.focus_window === second, 'tapping the other window again moves focus back');
  return [first, second];
}

async function fullscreenKeepsItsPlace(front: Meta.Window, behind: Meta.Window) {
  front.make_fullscreen();
  front.activate(global.get_current_time());
  await eventually(() => front.is_fullscreen() && global.display.focus_window === front, 'a window goes fullscreen with focus');
  await settled();
  const bottom: Point = [monitor().x + monitor().width / 2, monitor().y + monitor().height - 1];
  await pressesStayWith(front, behind, [['in the middle', middle()], ['at the bottom edge', bottom]], 'fullscreen', {require, eventually});
}

export async function run() {
  await settled();
  await touchesOnTheTaskbar();
  await taskbarFollowsAfterTouch();
  const app = gjs('clients/windows/window.js', ['--multiple', '--input']);
  try {
    const [first, second] = await tapsReachTheirWindow();
    await fullscreenKeepsItsPlace(second, first);
  } finally {
    await fold(false);
    await stop(app);
  }
}
