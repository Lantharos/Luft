import type Clutter from 'gi://Clutter';

export { blurSurface } from '../../shell/stage/kestrelGlass.js';

export const SURFACE_GAP = 10;

export function raiseSurface(actor: Clutter.Actor): void {
  const keyboard = global.compositor.get_input_panel_group();
  actor.get_parent()!.set_child_below_sibling(actor, keyboard);
}
