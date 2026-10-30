import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import {Spring, switchWorkspace, taskViewOpen, taskViewProgress, toggleSurface, touchpad as handleTouchpad, Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {openBoardWindow} from '../board/lib/board.js';
import {touchpad} from '../board/lib/touchpad.js';
import {existing} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {hold} from '../lib/frameClock.js';
import {stop, waitForWindow} from '../lib/processes.js';
import {nextFrame, pause, settled, waitUntil} from '../lib/wait.js';

const {require} = checks('motion');
const manager = global.workspace_manager;
const animation = () => Main.wm.workspaceAnimation;
const switching = () => animation().currentSwitch !== null;
const a11y = new Gio.Settings({schema_id: 'org.gnome.desktop.a11y.interface'});
const JUMP = 0.1;

const steps = (values: number[]) => values.slice(1).map((value, i) => Math.abs(value - values[i]));
const largestStep = (values: number[]) => Math.max(0, ...steps(values));
const jumps = (values: number[]) => steps(values).some((step, i, all) => step > JUMP && step > 2 * Math.max(all[i - 1] ?? 0, all[i + 1] ?? 0));

function visibleWorkspace() {
  const data = animation().currentSwitch;
  if (!data) return manager.get_active_workspace_index();
  const group = data.monitors.find(monitor => monitor.index === Main.layoutManager.primaryIndex) ?? data.monitors[0];
  return group.indexAt(group.progress);
}

async function settledOn(index: number, label: string) {
  await waitUntil(() => !switching() && manager.get_active_workspace_index() === index, label, 4000);
  await settled();
}

const holdSlides = () => hold(animation().currentSwitch!.monitors.map(group => group.get_transition('progress')!));

function switchMidWay(toward: number, instead: number) {
  const path = [visibleWorkspace()];
  const record = () => path.push(visibleWorkspace());
  switchWorkspace(toward);
  const first = holdSlides();
  first.step(5, record);
  switchWorkspace(instead);
  const second = holdSlides();
  while (!second.done) second.step(1, record);
  second.release();
  return {path, duration: first.duration};
}

async function checkWorkspaceSwitches() {
  let {path, duration} = switchMidWay(1, 0);
  require(duration < Spring.snappy.duration * 2, 'a workspace switch settles on the snappy spring');
  await settledOn(0, 'switching back mid-way ends on the first workspace');
  require(path.some(index => index > 0.05) && !jumps(path),
    'switching back mid-way turns around without jumping');

  ({path} = switchMidWay(1, 2));
  await settledOn(2, 'a second switch mid-way carries on to the third workspace');
  require(!jumps(path) && path.every((index, i) => i === 0 || index >= path[i - 1] - 0.01),
    'chained switches flow across without jumping back');
  switchWorkspace(0);
  await settledOn(0, 'the first workspace comes back');
}

const touchpadSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.peripherals.touchpad'});

function swipe(towardsPrevious: number) {
  const dx = touchpadSettings.get_boolean('natural-scroll') ? towardsPrevious : -towardsPrevious;
  const gesture = animation().swipeTracker.touchpadGesture;
  const send = (event: Clutter.Event) => gesture.handleEvent(global.stage, event);
  return {
    begin: () => send(touchpad.swipe('begin', 3, 0, 0)),
    still: () => send(touchpad.swipe('update', 3, 0, 0)),
    end: () => send(touchpad.swipe('end', 3, 0, 0)),
    steps: (count: number) => {
      for (let i = 0; i < count; i++) send(touchpad.swipe('update', 3, dx, 0));
    },
  };
}

async function checkWorkspaceSwipe() {
  const pushPast = swipe(40);
  pushPast.begin();
  pushPast.steps(40);
  const page = animation().currentSwitch!.baseMonitorGroup!;
  const tracked = animation().swipeTracker.trackedProgress;
  require(tracked < -0.3 && page.progress < 0 && page.progress > tracked,
    'swiping past the first workspace rubber-bands instead of stopping or following');
  pushPast.end();
  await settledOn(0, 'letting go past the first workspace springs back');

  const fling = swipe(-60);
  fling.begin();
  fling.steps(12);
  const early = animation().currentSwitch!.baseMonitorGroup!.progress;
  require(early > 0.1 && early < 0.5, 'a short swipe follows the fingers part of the way');
  fling.end();
  await settledOn(1, 'a quick swipe lands on the next workspace');

  const slow = swipe(-6);
  slow.begin();
  slow.steps(40);
  for (let i = 0; i < 10; i++) {
    slow.still();
    await pause(16);
  }
  slow.end();
  await settledOn(1, 'a slow short swipe that stops returns to where it started');
  switchWorkspace(0);
  await settledOn(0, 'the first workspace comes back after swiping');
}

const WINDOW_MOTION = ['scale-x', 'scale-y', 'x', 'y', 'opacity'];

async function holdWindowMotion(actor: Meta.WindowActor, label: string) {
  await waitUntil(() => actor.get_transition('scale-x'), label, 3000);
  return hold(WINDOW_MOTION.map(property => actor.get_transition(property)).filter(transition => transition !== null));
}

async function checkMinimizeRestore(window: Meta.Window) {
  const actor = window.get_compositor_private<Meta.WindowActor>();
  window.minimize();
  (await holdWindowMotion(actor, 'the window starts minimising')).step(5);
  const shrunk = actor.scale_x;
  window.unminimize();
  const growing = await holdWindowMotion(actor, 'the window starts restoring');
  const path = [shrunk];
  while (!growing.done) growing.step(1, () => path.push(actor.scale_x));
  growing.release();
  await waitUntil(() => !window.minimized && actor.get_transition('scale-x') === null && actor.get_transition('x') === null,
    'restoring mid-minimise finishes', 3000);
  await settled();
  const rect = window.get_buffer_rect();
  require(shrunk < 1 && largestStep(path) < 0.35, 'restoring mid-minimise grows back from where the window was');
  require(actor.scale_x === 1 && actor.opacity === 255 && actor.x === rect.x && actor.y === rect.y,
    'the restored window ends at its own place and size');

  window.minimize();
  await waitUntil(() => !actor.visible, 'the window minimises', 3000);
  window.unminimize();
  await pause(60);
  window.minimize();
  await waitUntil(() => window.minimized && !actor.visible && actor.get_transition('opacity') === null,
    'minimising mid-restore finishes hidden', 3000);
  window.unminimize();
  await waitUntil(() => actor.visible && actor.get_transition('scale-x') === null && actor.get_transition('opacity') === null,
    'the window restores again', 3000);
  require(actor.scale_x === 1 && actor.opacity === 255, 'nothing is left half-way after minimising and restoring quickly');
  window.activate(global.get_current_time());
}

async function checkTaskView() {
  const view = existing('kestrel-task-view');
  toggleSurface('tasks');
  await pause(80);
  toggleSurface('tasks');
  await waitUntil(() => !view.visible, 'the task view hides when closed mid-opening', 2000);
  toggleSurface('tasks');
  await waitUntil(() => taskViewProgress() === 1, 'the task view opens', 2000);
  toggleSurface('tasks');
  await pause(60);
  const leaving = taskViewProgress();
  toggleSurface('tasks');
  await nextFrame();
  require(leaving < 1 && taskViewProgress() >= leaving, 'reopening the task view mid-close carries on from where it was');
  await waitUntil(() => taskViewProgress() === 1, 'the reopened task view settles', 2000);
  require(taskViewOpen(), 'the reopened task view ends fully open');
  toggleSurface('tasks');
  await waitUntil(() => !view.visible, 'the task view closes', 2000);
}

const STEP = 12;

async function fourFingers(direction: number, steps: number, {thenHold = false} = {}) {
  handleTouchpad(touchpad.swipe('begin', 4));
  for (let i = 0; i < steps; i++) handleTouchpad(touchpad.swipe('update', 4, 0, direction * STEP));
  if (!thenHold) return;
  for (let i = 0; i < 12; i++) {
    handleTouchpad(touchpad.swipe('update', 4, 0, 0));
    await pause(16);
  }
}

const letGo = () => handleTouchpad(touchpad.swipe('end', 4));

async function checkTaskViewGesture() {
  const view = existing('kestrel-task-view');
  const shown = taskViewProgress;

  await fourFingers(1, 20, {thenHold: true});
  require(view.visible && shown() > 0 && shown() < 1,
    'four fingers moving down bring the task view in under the fingers');
  letGo();
  await waitUntil(() => !view.visible && !taskViewOpen(), 'letting go of a short, slow swipe puts the task view away', 2000);

  await fourFingers(1, 160);
  const stretched = shown();
  require(stretched > 1 && stretched < 1.5, 'swiping past fully open resists');
  letGo();
  await waitUntil(() => taskViewOpen() && shown() === 1, 'a long swipe down opens the task view', 2000);

  await fourFingers(-1, 20);
  require(shown() < 1, 'four fingers moving up take the task view away with them');
  for (let i = 0; i < 20; i++) handleTouchpad(touchpad.swipe('update', 4, 0, STEP));
  require(shown() >= 1, 'moving back down mid-way brings it back');
  for (let i = 0; i < 30; i++) handleTouchpad(touchpad.swipe('update', 4, 0, -STEP));
  letGo();
  await waitUntil(() => !view.visible && !taskViewOpen(), 'a quick swipe up closes the task view', 2000);
}

async function checkReducedWorkspaceSwitch() {
  a11y.set_string('reduced-motion', 'reduce');
  try {
    switchWorkspace(1);
    await nextFrame();
    const group = animation().currentSwitch!.monitors[0];
    require(group.progress === group.getWorkspaceProgress(manager.get_workspace_by_index(1)!),
      'with reduced motion a workspace switch shows the new workspace in place');
    await settledOn(1, 'with reduced motion the old workspace fades out');
    switchWorkspace(0);
    await settledOn(0, 'with reduced motion switching back fades too');
  } finally {
    a11y.reset('reduced-motion');
  }
}

export async function run() {
  const clients = ['First', 'Second'].map(title => openBoardWindow(title, 700, 460));
  const first = await waitForWindow(window => window.get_title()?.startsWith('First'), 'a first window opens');
  await waitForWindow(window => window.get_title()?.startsWith('Second'), 'a second window opens');
  first.change_workspace_by_index(1, false);
  await settled();
  const forced = global.force_animations;
  global.force_animations = true;
  try {
    await checkWorkspaceSwitches();
    await checkWorkspaceSwipe();
    await checkReducedWorkspaceSwitch();
    first.change_workspace_by_index(0, false);
    await settled();
    await checkMinimizeRestore(first);
    await checkTaskView();
    await checkTaskViewGesture();
  } finally {
    global.force_animations = forced;
    for (const client of clients) await stop(client);
  }
}
