import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';
import {Spring} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {checks} from '../lib/check.js';
import {nextFrame, pause, waitUntil} from '../lib/wait.js';

const {require} = checks('motion');

function testActor() {
  const actor = new Clutter.Actor({width: 200, height: 200});
  global.stage.add_child(actor);
  return actor;
}

async function checkSpring() {
  const actor = testActor();
  try {
    let finished = null;
    actor.ease({translation_x: 400, spring: Spring.snappy, onStopped: done => (finished = done)});
    const transition = actor.get_transition('translation-x');
    require(transition instanceof Shell.SpringTransition, 'ease() with a spring runs a native spring transition');
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
    const moving = actor.get_transition('translation-x').get_velocity();
    const position = actor.translation_x;
    require(moving > 0 && position > 0 && position < 600, 'a spring is under way');
    actor.ease({translation_x: 0, spring: Spring.smooth});
    const reversed = actor.get_transition('translation-x');
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
    let finished = null;
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
}
