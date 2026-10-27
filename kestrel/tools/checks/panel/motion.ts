import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import Gio from 'gi://Gio';
import St from 'gi://St';
import {dismissImmediately, Spring, toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {nextFrame, pause, settled, waitUntil} from '../lib/wait.js';

const {require} = checks('motion');
type Surface = Parameters<typeof toggleSurface>[0];

const SURFACES: [Surface, string][] = [['start', 'kestrel-start'], ['quick', 'kestrel-quick-settings'], ['notifications', 'kestrel-notifications']];
const a11y = new Gio.Settings({schema_id: 'org.gnome.desktop.a11y.interface'});

function sample(actor: Clutter.Actor, frames: number, record: (actor: Clutter.Actor) => void) {
  return new Promise<void>(resolve => {
    let left = frames;
    const id = global.stage.connect_after('after-paint', () => {
      record(actor);
      if (--left > 0) return;
      global.stage.disconnect(id);
      resolve();
    });
    global.stage.queue_redraw();
  });
}

const resting = (actor: Clutter.Actor) => actor.get_transition('translation-y') === null && actor.get_transition('opacity') === null;

async function checkInterruptedSurface(surface: Surface, name: string) {
  dismissImmediately();
  await settled();
  const actor = named(name)!;
  toggleSurface(surface);
  require(actor.get_transition('translation-y')!.duration < Spring.snappy.duration * 2,
    `${surface} stops repainting soon after its slide stops moving`);
  await pause(80);
  await nextFrame();
  const before = actor.translation_y;
  toggleSurface(surface);
  const heights: number[] = [];
  await sample(actor, 3, () => heights.push(actor.translation_y));
  require(heights.some(height => height > before), `${surface} starts back down at once when closed 80 ms into opening`);
  await waitUntil(() => !actor.visible && resting(actor), `${surface} hides after closing mid-way`, 2000);

  toggleSurface(surface);
  await waitUntil(() => resting(actor), `${surface} opens`, 2000);
  toggleSurface(surface);
  await pause(60);
  toggleSurface(surface);
  await waitUntil(() => resting(actor), `${surface} settles after reopening mid-close`, 2000);
  require(actor.visible && actor.translation_y === 0 && actor.opacity === 255,
    `${surface} ends fully open when reopened 60 ms into closing`);
  toggleSurface(surface);
  await waitUntil(() => !actor.visible, `${surface} closes`, 2000);
}

async function checkReducedSurface(surface: Surface, name: string) {
  dismissImmediately();
  await settled();
  const actor = named(name)!;
  const offsets: number[] = [];
  const opacities: number[] = [];
  toggleSurface(surface);
  await sample(actor, 8, () => {
    offsets.push(actor.translation_y);
    opacities.push(actor.opacity);
  });
  require(offsets.every(offset => offset === 0) && opacities.some(opacity => opacity > 0 && opacity < 255),
    `with reduced motion ${surface} fades in without sliding`);
  toggleSurface(surface);
  await waitUntil(() => !actor.visible, `${surface} closes with reduced motion`, 2000);
  require(actor.translation_y === 0, `with reduced motion ${surface} fades out without sliding`);
}

async function checkClippedAtTaskbar() {
  dismissImmediately();
  await settled();
  const actor = named('kestrel-start')!;
  const top = named('kestrel-panel')!.get_transformed_position()[1];
  toggleSurface('start');
  await waitUntil(() => resting(actor), 'start opens', 2000);
  toggleSurface('start');
  const frames: {bottom: number; clip: number}[] = [];
  await sample(actor, 6, () => {
    const [, y] = actor.get_transformed_position();
    const parent = actor.get_parent()!;
    const [, , , clipHeight] = parent.get_clip();
    frames.push({bottom: y + actor.height, clip: parent.has_clip ? clipHeight : Infinity});
  });
  require(frames.some(frame => frame.bottom > top) && frames.every(frame => Math.abs(frame.clip - top) < 1),
    'a closing surface is cut off at the top of the taskbar');
  await waitUntil(() => !actor.visible, 'start closes', 2000);
}

function springOf(actor: Clutter.Actor) {
  const transition = actor.get_transition('translation-x');
  if (!(transition instanceof Shell.SpringTransition)) throw new Error('The actor is not moving on a spring');
  return transition;
}

function testActor() {
  const actor = new Clutter.Actor({width: 200, height: 200});
  global.stage.add_child(actor);
  return actor;
}

async function checkSpring() {
  const actor = testActor();
  try {
    let finished: boolean | null = null;
    actor.ease({translation_x: 400, spring: Spring.snappy, onStopped: done => (finished = done)});
    const found = actor.get_transition('translation-x');
    const transition = require(found instanceof Shell.SpringTransition && found, 'ease() with a spring runs a native spring transition');
    require(transition.duration > Spring.snappy.duration && transition.duration < Spring.snappy.duration * 2,
      'a spring from rest settles a little after its perceptual duration');
    await waitUntil(() => finished !== null, 'the spring finishes', 2000);
    require(finished && actor.translation_x === 400 && !actor.get_transition('translation-x'),
      'a finished spring lands exactly on its target and removes itself');
  } finally {
    actor.destroy();
  }
}

async function checkRetarget() {
  const actor = testActor();
  try {
    actor.ease({translation_x: 600, spring: Spring.smooth});
    await pause(90);
    await nextFrame();
    const moving = springOf(actor).get_velocity();
    const position = actor.translation_x;
    require(moving > 0 && position > 0 && position < 600, 'a spring is under way');
    actor.ease({translation_x: 0, spring: Spring.smooth});
    const reversed = springOf(actor);
    require(Math.abs(reversed.velocity - moving) < 1, 'a spring replacing another starts with its velocity');
    await nextFrame();
    await nextFrame();
    require(actor.translation_x > position, 'the replaced spring keeps moving forward before it turns back');
    await waitUntil(() => !actor.get_transition('translation-x'), 'the reversed spring settles', 2000);
    require(actor.translation_x === 0, 'the reversed spring ends at its new target');
  } finally {
    actor.destroy();
  }
}

async function checkDisabledAnimations() {
  const settings = St.Settings.get();
  const actor = testActor();
  settings.inhibit_animations();
  try {
    let finished: boolean | null = null;
    actor.ease({translation_y: 120, opacity: 40, spring: Spring.snappy, onStopped: done => (finished = done)});
    require(finished === true && actor.translation_y === 120 && actor.opacity === 40 && !actor.get_transition('translation-y'),
      'with animations off a spring lands at once');
  } finally {
    settings.uninhibit_animations();
    actor.destroy();
  }
}

export async function run() {
  await checkSpring();
  await checkRetarget();
  await checkDisabledAnimations();
  for (const [surface, name] of SURFACES) await checkInterruptedSurface(surface, name);
  await checkClippedAtTaskbar();
  a11y.set_string('reduced-motion', 'reduce');
  try {
    for (const [surface, name] of SURFACES) await checkReducedSurface(surface, name);
  } finally {
    a11y.reset('reduced-motion');
  }
}
