import type Clutter from 'gi://Clutter';
import Graphene from 'gi://Graphene';

const PRESS_DEPTH = 0.04;

export function whenGraphicsRestored(restored: () => void): () => void {
  const recovery = global.stage.context.get_backend().get_graphics_recovery_context();
  const id = recovery.connect('graphics-restored', restored);
  return () => recovery.disconnect(id);
}

export function pixelScale(actor: Clutter.Actor): number {
  return actor.get_real_resource_scale();
}

export function iconPixels(size: number, scale: number): number {
  return Math.ceil(Math.fround(size * scale));
}

export interface PixelFrame {
  outer: number;
  inner: number;
  inset: number;
}

export function frameOnPixels(outer: number, inner: number, scale: number): PixelFrame {
  const innerPixels = iconPixels(inner, scale);
  const fitting = Math.floor(outer * scale);
  const outerPixels = fitting - (fitting - innerPixels) % 2;
  return { outer: outerPixels / scale, inner: innerPixels / scale, inset: (outerPixels - innerPixels) / 2 / scale };
}

export function laidOutX(actor: Clutter.Actor): number {
  let x = 0;
  for (let ancestor: Clutter.Actor | null = actor; ancestor; ancestor = ancestor.get_parent()) x += ancestor.get_allocation_box().x1;
  return x;
}

export interface Press {
  scale: number;
  pivot: [number, number];
}

export function pressOnPixels(actor: Clutter.Actor): Press {
  const scale = pixelScale(actor);
  const pixels = Math.round(actor.width * scale);
  const depth = 2 * Math.max(1, Math.round(pixels * PRESS_DEPTH / 2));
  const { x1, y1 } = actor.get_allocation_box();
  const origin = actor.get_parent()!.apply_relative_transform_to_point(null, new Graphene.Point3D({ x: x1, y: y1, z: 0 }));
  const pivot = (start: number) => (Math.round(start * scale + depth / 2) - start * scale) / depth;
  return { scale: (pixels - depth) / pixels, pivot: [pivot(origin.x), pivot(origin.y)] };
}

export function whenPixelScaleChanges(actor: Clutter.Actor, changed: () => void): void {
  actor.connect('real-resource-scale-changed', changed);
}
