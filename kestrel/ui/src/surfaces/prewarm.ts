import type Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import type St from 'gi://St';

const { util_paint_offscreen: paintOffscreen } = Shell as unknown as { util_paint_offscreen(actor: Clutter.Actor): void };

interface StartupSignals {
  connect(signal: 'startup-complete', callback: () => void): number;
  disconnect(id: number): void;
}

export function paintHidden(actor: Clutter.Actor, focused: St.Widget | null = null): void {
  if (actor.visible) return;
  const translation = actor.translation_y;
  actor.translation_y = 0;
  focused?.add_style_pseudo_class('focus');
  paintOffscreen(actor);
  focused?.remove_style_pseudo_class('focus');
  actor.translation_y = translation;
}

export function prewarmSoon(steps: (() => void)[]): () => void {
  let source = GLib.idle_add(GLib.PRIORITY_LOW, () => {
    steps.shift()!();
    if (steps.length) return GLib.SOURCE_CONTINUE;
    source = 0;
    return GLib.SOURCE_REMOVE;
  });
  return () => {
    if (source) GLib.Source.remove(source);
    source = 0;
  };
}

export function prewarmAfterStartup(layoutManager: StartupSignals, steps: (() => void)[]): () => void {
  let cancel = () => {};
  let startup = layoutManager.connect('startup-complete', () => {
    layoutManager.disconnect(startup);
    startup = 0;
    cancel = prewarmSoon(steps);
  });
  return () => {
    if (startup) layoutManager.disconnect(startup);
    cancel();
  };
}
