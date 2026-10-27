import type Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';

export const PILL = 999;
const THEMED_PROPERTIES = [
  ['-kestrel-glass-dim', 'bright-dim'],
  ['-kestrel-glass-lift', 'dark-lift'],
  ['-kestrel-glass-saturation', 'saturation'],
] as const;
const SELECTION_STATES = ['hover', 'focus', 'active', 'selected', 'checked'];

interface Backdrop {
  actor: St.Widget;
  effect: Shell.BlurEffect;
  corners: number;
}

const surfaces = new Set<Backdrop>();
const cornered = new Set<Backdrop>();
let solid = false;
let square = false;

function toggleStyleClass(actor: St.Widget, name: string, enabled: boolean): void {
  if (enabled) actor.add_style_class_name(name);
  else actor.remove_style_class_name(name);
}

function makeSolid({ actor, effect, corners }: Backdrop, enabled: boolean): void {
  effect.enabled = !enabled;
  for (const name of ['kestrel-solid', `kestrel-solid-${corners}`])
    toggleStyleClass(actor, name, enabled);
}

export function setSolidSurfaces(enabled: boolean): void {
  if (solid === enabled) return;
  solid = enabled;
  for (const surface of surfaces) makeSolid(surface, enabled);
}

function followCorners({ actor, effect, corners }: Backdrop): void {
  const squared = square && corners !== PILL;
  effect.set_property('corner-radius', squared ? 0 : corners);
  toggleStyleClass(actor, 'kestrel-square-surface', squared);
}

export function setSquareSurfaces(enabled: boolean): void {
  if (square === enabled) return;
  square = enabled;
  for (const surface of [...surfaces, ...cornered]) followCorners(surface);
}

export function followWindowCorners(actor: St.Widget, effect: Shell.BlurEffect, corners: number): void {
  const backdrop = { actor, effect, corners };
  cornered.add(backdrop);
  if (square) followCorners(backdrop);
  actor.connect('destroy', () => cornered.delete(backdrop));
}

function followTheme(actor: St.Widget, effect: Shell.BlurEffect): void {
  actor.connect('style-changed', () => {
    const node = actor.get_theme_node();
    for (const [property, name] of THEMED_PROPERTIES) {
      const [found, value] = node.lookup_double(property, true);
      if (found) effect.set_property(name, value);
    }
  });
}

export function blurBackdrop(actor: St.Widget, corners: number): Shell.BlurEffect {
  const theme = St.ThemeContext.get_for_stage(global.stage);
  const effect = new Shell.BlurEffect({
    mode: Shell.BlurMode.BACKGROUND,
    radius: 30 * theme.scale_factor,
    brightness: 1,
  });
  effect.set_property('corner-radius', corners);
  followTheme(actor, effect);
  actor.add_effect_with_name('backdrop', effect);
  const changed = theme.connect('notify::scale-factor', () => {
    effect.radius = 30 * theme.scale_factor;
  });
  actor.connect('destroy', () => theme.disconnect(changed));
  return effect;
}

export function blurSurface(actor: St.Widget, corners = 24): void {
  const surface = { actor, effect: blurBackdrop(actor, corners), corners };
  surfaces.add(surface);
  if (solid) makeSolid(surface, true);
  if (square) followCorners(surface);
  actor.connect('destroy', () => surfaces.delete(surface));
}

export function styleSurface(actor: St.Widget, corners = 24): void {
  actor.add_style_class_name('kestrel-glass');
  actor.add_style_class_name(`kestrel-glass-radius-${corners}`);
  blurSurface(actor, corners);
}

export function freezeSelection(root: Clutter.Actor): () => void {
  const visit = (actor: Clutter.Actor, freeze: boolean) => {
    if (actor instanceof St.Widget) {
      if (freeze && SELECTION_STATES.some(state => actor.has_style_pseudo_class(state)))
        actor.add_style_class_name('kestrel-closing-selection');
      else if (!freeze)
        actor.remove_style_class_name('kestrel-closing-selection');
    }
    for (const child of actor.get_children()) visit(child, freeze);
  };
  const visitContents = (freeze: boolean) => root.get_children().forEach(child => visit(child, freeze));
  visitContents(true);
  return () => visitContents(false);
}
