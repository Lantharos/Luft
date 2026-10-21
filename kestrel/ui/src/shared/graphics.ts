import type Clutter from 'gi://Clutter';

export function whenGraphicsRestored(restored: () => void): () => void {
  const recovery = global.stage.context.get_backend().get_graphics_recovery_context();
  const id = recovery.connect('graphics-restored', restored);
  return () => recovery.disconnect(id);
}

export function pixelScale(actor: Clutter.Actor): number {
  return actor.get_real_resource_scale();
}

export function whenPixelScaleChanges(actor: Clutter.Actor, changed: () => void): void {
  actor.connect('real-resource-scale-changed', changed);
}
