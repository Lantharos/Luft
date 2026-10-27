import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Graphene from 'gi://Graphene';
import Shell from 'gi://Shell';
import St from 'gi://St';

import type { EaseOptions, EaseProperties, EaseSpring } from '../../environment.js';
import { adjustAnimationTime } from './animationUtils.js';
import { logErrorUnlessCancelled } from './errorUtils.js';
import { TransientSignalHolder } from './signalTracker.js';

interface Animatable extends Clutter.Animatable {
  add_transition(name: string, transition: Clutter.Transition): void;
  remove_transition(name: string): void;
  get_transition(name: string): Clutter.Transition | null;
}

interface SpringOptions {
  velocity?: EaseOptions['velocity'];
  epsilon?: number;
  delay?: number;
  animationRequired: boolean;
  onComplete?: () => void;
  onStopped?: (isFinished: boolean) => void;
}

type Targets = Record<string, unknown>;
type EaseCallback = (isFinished: boolean) => void;

const sessionSignalHolder = new TransientSignalHolder();

const setEasingDuration = Clutter.Actor.prototype.set_easing_duration;
const setEasingDelay = Clutter.Actor.prototype.set_easing_delay;

function easeCallback(options: Pick<EaseOptions, 'onComplete' | 'onStopped'>, cleanup: (() => void) | null) {
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  const callback: EaseCallback = isFinished => {
    cleanup?.();

    options.onStopped?.(isFinished);
    if (isFinished) options.onComplete?.();

    if (isFinished) resolve();
    else reject(GLib.Error.new_literal(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED, 'Transition was stopped before completing'));
  };

  return { promise, callback };
}

function awaitTransition(transition: Clutter.Transition, actor: Clutter.Actor | null, callback: EaseCallback, prepare: (() => void) | null): void {
  const signalHolder = new TransientSignalHolder(sessionSignalHolder);

  const complete = (finished: boolean) => {
    signalHolder.destroy();
    callback(finished);
  };

  if (prepare) {
    if (transition.delay) transition.connectObject('started', () => prepare(), signalHolder);
    else prepare();
  }

  transition.connectObject('stopped', (_transition: Clutter.Transition, finished: boolean) => complete(finished), signalHolder);

  actor?.connectObject(
    'transition-removed', (_actor: Clutter.Actor, removed: Clutter.Transition, finished: boolean) => {
      if (removed === transition) complete(finished);
    },
    'destroy', () => complete(false),
    signalHolder);
}

function unredirectHooks(duration: number) {
  if (!duration) return { prepare: null, cleanup: null };

  let canCleanup = false;
  const prepare = () => {
    global.compositor.disable_unredirect();
    canCleanup = true;
  };
  const cleanup = () => {
    if (canCleanup) global.compositor.enable_unredirect();
  };

  return { prepare, cleanup };
}

function propertyTarget(animatable: Animatable, name: string): [object, string] {
  if (!name.startsWith('@')) return [animatable, name];

  const actor = animatable as Clutter.Actor;
  const [type, child, property] = name.split('.');
  switch (type) {
    case '@layout':
      return [actor.layout_manager, child];
    case '@actions':
      return [actor.get_action(child)!, property];
    case '@constraints':
      return [actor.get_constraint(child)!, property];
    case '@content':
      return [actor.content, child];
    case '@effects':
      return [actor.get_effect(child)!, property];
  }

  throw new Error(`Invalid property name ${name}`);
}

function setProperty(animatable: Animatable, name: string, value: unknown): void {
  const [object, property] = propertyTarget(animatable, name);
  (object as Record<string, unknown>)[property] = value;
}

function springBounce(spring: EaseSpring): number {
  const reduced = St.Settings.get().reducedMotion === St.ReducedMotion.REDUCE;
  return reduced ? Math.min(0, spring.bounce) : spring.bounce;
}

function velocityOf(velocity: EaseOptions['velocity'], property: string): number | undefined {
  return typeof velocity === 'number' ? velocity : velocity?.[property];
}

function setCurve(transition: Clutter.Timeline, [x1, y1, x2, y2]: readonly number[]): void {
  transition.set_cubic_bezier_progress(new Graphene.Point({ x: x1, y: y1 }), new Graphene.Point({ x: x2, y: y2 }));
}

function springEase(animatable: Animatable, actor: Clutter.Actor | null, targets: Targets, spring: EaseSpring, options: SpringOptions): Promise<void> {
  const { velocity, epsilon, animationRequired } = options;
  const duration = actor?.mapped ? adjustAnimationTime(spring.duration, { animationRequired }) : 0;
  const { prepare, cleanup } = unredirectHooks(duration);
  const { promise, callback } = easeCallback(options, cleanup);

  if (duration === 0) {
    for (const [property, target] of Object.entries(targets)) {
      animatable.remove_transition(property.replaceAll('_', '-'));
      setProperty(animatable, property, target);
    }
    prepare?.();
    callback(true);
    return promise;
  }

  const bounce = springBounce(spring);
  const delay = options.delay ? adjustAnimationTime(options.delay, { animationRequired }) : 0;
  let longest: Shell.SpringTransition | null = null;
  for (const [property, target] of Object.entries(targets)) {
    const name = property.replaceAll('_', '-');
    const running = animatable.get_transition(name);
    const startVelocity = velocityOf(velocity, property) ??
      (running instanceof Shell.SpringTransition ? running.get_velocity() : 0);
    animatable.remove_transition(name);
    const transition = Shell.SpringTransition.new(name, target as number, duration, bounce, startVelocity);
    transition.delay = delay;
    if (epsilon) transition.epsilon = epsilon;
    animatable.add_transition(name, transition);
    if (!longest || transition.duration > longest.duration) longest = transition;
  }

  if (longest) {
    awaitTransition(longest, actor, callback, prepare);
  } else {
    prepare?.();
    callback(true);
  }
  return promise;
}

function easeActor(actor: Clutter.Actor, properties: EaseProperties): Promise<void> {
  const {
    duration, delay, mode, curve, spring, velocity, epsilon, onComplete, onStopped,
    repeatCount = 0, autoReverse = false, animationRequired = false, ...targets
  } = properties;

  if (spring) return springEase(actor, actor, targets, spring, { velocity, epsilon, delay, onComplete, onStopped, animationRequired });

  actor.save_easing_state();

  setEasingDuration.call(actor, adjustAnimationTime(duration ?? actor.get_easing_duration(), { animationRequired }));
  if (delay !== undefined) setEasingDelay.call(actor, adjustAnimationTime(delay, { animationRequired }));

  const isReversed = autoReverse && (repeatCount + 1) % 2 === 0;

  if (mode !== undefined) actor.set_easing_mode(mode);

  const easingDuration = actor.get_easing_duration();
  const { prepare, cleanup } = unredirectHooks(easingDuration);
  const { promise, callback } = easeCallback({ onComplete, onStopped }, cleanup);

  const animated = Object.keys(targets).map(property => property.replaceAll('_', '-'));
  animated.forEach(name => actor.remove_transition(name));

  if (easingDuration > 0 || !isReversed) actor.set(targets as Partial<Clutter.Actor.ConstructorProps>);
  actor.restore_easing_state();

  const transitions = animated.map(name => actor.get_transition(name)).filter(transition => transition !== null);
  for (const transition of transitions) {
    transition.repeat_count = repeatCount;
    transition.auto_reverse = autoReverse;
    if (curve) setCurve(transition, curve);
  }

  const [transition] = transitions;
  if (transition) {
    awaitTransition(transition, actor, callback, prepare);
  } else {
    prepare?.();
    callback(true);
  }

  return promise;
}

function easeProperty(animatable: Animatable, name: string, target: unknown, options: EaseOptions): Promise<void> {
  const {
    duration, delay, mode, curve, spring, velocity, epsilon, onComplete, onStopped,
    repeatCount = 0, autoReverse = false, animationRequired = false,
  } = options;
  const actor = animatable.get_actor();

  if (spring) return springEase(animatable, actor, { [name]: target }, spring, { velocity, epsilon, delay, onComplete, onStopped, animationRequired });

  const isReversed = autoReverse && (repeatCount + 1) % 2 === 0;
  const length = actor?.mapped && duration ? Math.floor(adjustAnimationTime(duration, { animationRequired })) : 0;

  const { prepare, cleanup } = unredirectHooks(length);
  const { promise, callback } = easeCallback({ onComplete, onStopped }, cleanup);

  animatable.remove_transition(name);

  if (length === 0) {
    if (!isReversed) setProperty(animatable, name, target);

    prepare?.();
    callback(true);

    return promise;
  }

  const transition = new Clutter.PropertyTransition({
    property_name: name,
    interval: new Clutter.Interval({ value_type: animatable.find_property(name).value_type }),
    remove_on_complete: true,
    repeat_count: repeatCount,
    auto_reverse: autoReverse,
    duration: length,
    delay: delay ? adjustAnimationTime(delay, { animationRequired }) : 0,
    ...(mode ? { progress_mode: mode } : {}),
  });
  if (curve) setCurve(transition, curve);
  animatable.add_transition(name, transition);

  transition.set_to(target);

  awaitTransition(transition, actor, callback, prepare);

  return promise;
}

export function installEasing(): void {
  global.connectObject('shutdown', () => sessionSignalHolder.destroy(), sessionSignalHolder);

  Clutter.Actor.prototype.set_easing_duration = function (msecs: number) {
    setEasingDuration.call(this, adjustAnimationTime(msecs));
  };

  Clutter.Actor.prototype.ease = function (properties: EaseProperties) {
    easeActor(this, properties).catch(logErrorUnlessCancelled);
  };
  Clutter.Actor.prototype.ease_property = function (name: string, target: unknown, options: EaseOptions) {
    easeProperty(this, name, target, options).catch(logErrorUnlessCancelled);
  };
  Clutter.Actor.prototype.easeAsync = async function (properties: EaseProperties) {
    await easeActor(this, properties);
  };

  St.Adjustment.prototype.ease = function (target: number, options: EaseOptions) {
    easeProperty(this, 'value', target, options).catch(logErrorUnlessCancelled);
  };
}
