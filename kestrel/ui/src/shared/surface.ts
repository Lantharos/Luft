import type Clutter from 'gi://Clutter';
import type Shell from 'gi://Shell';

export { blurSurface } from 'resource:///com/lantharos/kestrel/ui/kestrelGlass.js';

export const SURFACE_GAP = 10;

export function raiseSurface(actor: Clutter.Actor): void {
  const keyboard = (global as unknown as Shell.Global).compositor.get_input_panel_group();
  actor.get_parent()!.set_child_below_sibling(actor, keyboard);
}
