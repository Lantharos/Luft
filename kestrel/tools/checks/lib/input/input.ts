import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {nextFrame, pause} from '../wait.js';

const DRAG_STEP = 16;
export type Point = [number, number];
export type Target = Point | Clutter.Actor;

const REST: Point = [20, 20];

const now = () => GLib.get_monotonic_time();
const seat = global.stage.context.get_backend().get_default_seat();
const devices = {
  pointer: seat.create_virtual_device(Clutter.InputDeviceType.POINTER_DEVICE),
  keyboard: seat.create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE),
};

export const pointer = () => devices.pointer;
export const keyboard = () => devices.keyboard;

export function hold(...keys: number[]) {
  for (const key of keys) keyboard().notify_keyval(now(), key, Clutter.KeyState.PRESSED);
}

export function release(...keys: number[]) {
  for (const key of keys.toReversed()) keyboard().notify_keyval(now(), key, Clutter.KeyState.RELEASED);
}

export function press(...keys: number[]) {
  hold(...keys);
  release(...keys);
}

export function type(text: string) {
  for (const character of text) press(Clutter.unicode_to_keysym(character.codePointAt(0)!));
}

export function erase(text: string) {
  for (const _ of text) press(Clutter.KEY_BackSpace);
}

export function centerOf(actor: Clutter.Actor): Point {
  const [x, y] = actor.get_transformed_position();
  return [x + actor.width / 2, y + actor.height / 2];
}

const pointOf = (target: Target): Point => Array.isArray(target) ? target : centerOf(target);

export function moveTo(target: Target) {
  const [x, y] = pointOf(target);
  pointer().notify_absolute_motion(now(), x, y);
}

export function rest() {
  moveTo(REST);
}

export function moveBy(dx: number, dy: number) {
  pointer().notify_relative_motion(now(), dx, dy);
}

export function pressButton(button: number = Clutter.BUTTON_PRIMARY) {
  pointer().notify_button(now(), button, Clutter.ButtonState.PRESSED);
}

export function releaseButton(button: number = Clutter.BUTTON_PRIMARY) {
  pointer().notify_button(now(), button, Clutter.ButtonState.RELEASED);
}

export function click(target: Target, button: number = Clutter.BUTTON_PRIMARY) {
  moveTo(target);
  pressButton(button);
  releaseButton(button);
}

export function rightClick(target: Target) {
  click(target, Clutter.BUTTON_SECONDARY);
}

export function scroll(direction: Clutter.ScrollDirection, target: Target | null = null) {
  if (target) moveTo(target);
  pointer().notify_discrete_scroll(now(), direction, Clutter.ScrollSource.WHEEL);
}

export interface DragOptions {
  steps?: number;
  interval?: number;
  hover?: number;
}

export async function drag(from: Target, to: Target, {steps = 12, interval = DRAG_STEP, hover = 0}: DragOptions = {}) {
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

export async function chord(...keys: number[]) {
  const key = keys.pop()!;
  for (const modifier of keys) {
    hold(modifier);
    await nextFrame();
  }
  press(key);
  await nextFrame();
  release(...keys);
}

export interface FingerScrollOptions {
  steps?: number;
  interval?: number;
  horizontal?: boolean;
}

export async function fingerScroll(distance: number, {steps = 12, interval = DRAG_STEP, horizontal = false}: FingerScrollOptions = {}) {
  const [dx, dy] = horizontal ? [distance / steps, 0] : [0, distance / steps];
  for (let step = 0; step < steps; step++) {
    pointer().notify_scroll_continuous(now(), dx, dy, Clutter.ScrollSource.FINGER, Clutter.ScrollFinishFlags.NONE);
    await pause(interval);
  }
}

export function liftFingers() {
  pointer().notify_scroll_continuous(now(), 0, 0, Clutter.ScrollSource.FINGER, Clutter.ScrollFinishFlags.HORIZONTAL | Clutter.ScrollFinishFlags.VERTICAL);
}

export function pinch(phase: Clutter.TouchpadGesturePhase, scale = 1, fingers = 2) {
  pointer().notify_touchpad_pinch(now(), phase, fingers, 0, 0, 0, scale);
}

export function swipe(phase: Clutter.TouchpadGesturePhase, dx = 0, dy = 0, fingers = 3) {
  pointer().notify_touchpad_swipe(now(), phase, fingers, dx, dy);
}
