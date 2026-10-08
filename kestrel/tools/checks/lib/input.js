import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {nextFrame, pause} from './wait.js';

const DRAG_STEP = 16;
const REST = [20, 20];

const now = () => GLib.get_monotonic_time();
const seat = global.stage.context.get_backend().get_default_seat();
const devices = {
  pointer: seat.create_virtual_device(Clutter.InputDeviceType.POINTER_DEVICE),
  keyboard: seat.create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE),
};

export const pointer = () => devices.pointer;
export const keyboard = () => devices.keyboard;

export function hold(...keys) {
  for (const key of keys) keyboard().notify_keyval(now(), key, Clutter.KeyState.PRESSED);
}

export function release(...keys) {
  for (const key of keys.toReversed()) keyboard().notify_keyval(now(), key, Clutter.KeyState.RELEASED);
}

export function press(...keys) {
  hold(...keys);
  release(...keys);
}

export function type(text) {
  for (const character of text) press(Clutter.unicode_to_keysym(character.codePointAt(0)));
}

export function erase(text) {
  for (const _ of text) press(Clutter.KEY_BackSpace);
}

export function centerOf(actor) {
  const [x, y] = actor.get_transformed_position();
  return [x + actor.width / 2, y + actor.height / 2];
}

const pointOf = target => Array.isArray(target) ? target : centerOf(target);

export function moveTo(target) {
  const [x, y] = pointOf(target);
  pointer().notify_absolute_motion(now(), x, y);
}

export function rest() {
  moveTo(REST);
}

export function moveBy(dx, dy) {
  pointer().notify_relative_motion(now(), dx, dy);
}

export function pressButton(button = Clutter.BUTTON_PRIMARY) {
  pointer().notify_button(now(), button, Clutter.ButtonState.PRESSED);
}

export function releaseButton(button = Clutter.BUTTON_PRIMARY) {
  pointer().notify_button(now(), button, Clutter.ButtonState.RELEASED);
}

export function click(target, button = Clutter.BUTTON_PRIMARY) {
  moveTo(target);
  pressButton(button);
  releaseButton(button);
}

export function rightClick(target) {
  click(target, Clutter.BUTTON_SECONDARY);
}

export function scroll(direction, target = null) {
  if (target) moveTo(target);
  pointer().notify_discrete_scroll(now(), direction, Clutter.ScrollSource.WHEEL);
}

export async function drag(from, to, {steps = 12, interval = DRAG_STEP, hover = 0} = {}) {
  const [fromX, fromY] = pointOf(from);
  const [toX, toY] = pointOf(to);
  moveTo([fromX, fromY]);
  pressButton();
  await pause(interval);
  for (let step = 1; step <= steps; step++) {
    moveTo([fromX + (toX - fromX) * step / steps, fromY + (toY - fromY) * step / steps]);
    await pause(interval);
  }
  if (hover) await pause(hover);
  releaseButton();
}

export async function chord(...keys) {
  const key = keys.pop();
  for (const modifier of keys) {
    hold(modifier);
    await nextFrame();
  }
  press(key);
  await nextFrame();
  release(...keys);
}
