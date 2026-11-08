import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import type { ElementActor, ElementLayout } from '../../../../desktop/panel/elements/extensionElements.js';
import type { DragDelegate } from '../../../../shared/popups/dndTargets.js';
import { animateActor } from '../../../../shared/motion/motion.js';
import type { ControlHost } from '../popups/controls.js';
import { RenderedView } from '../popups/render.js';
import type { View } from '../types.js';

const GROW = { duration: 320, mode: Clutter.AnimationMode.EASE_OUT_QUART };
const FADE = { duration: 200, mode: Clutter.AnimationMode.EASE_OUT_QUAD };

/** What an element shows, as the extension last described it. */
export interface ElementState {
  shown: boolean;
  content(layout: ElementLayout): View;
  expanded: ((layout: ElementLayout) => View) | null;
  takesFiles: boolean;
}

export interface ElementHandlers {
  click(actor: Clutter.Actor): void;
  menu(actor: Clutter.Actor): void;
  expanded(expanded: boolean): void;
  drop(paths: string[]): void;
  /** Runs an extension callback, returning what it returned, or `undefined` when it threw. */
  run<Result>(build: () => Result): Result | undefined;
}

const CONTROLS = [St.Button, St.Entry];

function insideControl(target: Clutter.Actor | null, element: Clutter.Actor): boolean {
  for (let actor = target; actor && actor !== element; actor = actor.get_parent())
    if (CONTROLS.some(type => actor instanceof type) || (actor instanceof St.Widget && actor.has_style_class_name('slider'))) return true;
  return false;
}

/** One taskbar's view of an element: its compact content, what it grows to under the pointer, and how it comes and goes. */
export class ElementWidget implements ElementActor {
  readonly actor = new St.Widget({
    style_class: 'kestrel-extension-element', layout_manager: new Clutter.BinLayout(), clip_to_allocation: true,
    reactive: true, track_hover: true, x_align: Clutter.ActorAlign.START, y_align: Clutter.ActorAlign.CENTER,
  });
  private readonly compact: RenderedView;
  private readonly grown: RenderedView;
  private growing = false;
  private shown = false;
  private waiting = 0;

  constructor(private readonly state: () => ElementState, controls: ControlHost, private readonly handlers: ElementHandlers, private layout: ElementLayout) {
    this.compact = new RenderedView(controls);
    this.grown = new RenderedView(controls);
    for (const view of [this.compact, this.grown]) {
      view.actor.x_align = Clutter.ActorAlign.START;
      view.actor.y_align = Clutter.ActorAlign.CENTER;
      view.actor.x_expand = false;
      this.actor.add_child(view.actor);
    }
    this.grown.actor.visible = false;
    this.grown.actor.opacity = 0;
    this.actor.connect('notify::hover', () => this.sync(true));
    this.actor.connect('button-release-event', (_actor, event) => this.released(event));
    (this.actor as St.Widget & { _delegate?: DragDelegate })._delegate = {
      fileDrop: {
        takes: () => this.state().takesFiles,
        hover: over => (over ? this.actor.add_style_class_name('dropping') : this.actor.remove_style_class_name('dropping')),
        drop: paths => handlers.drop(paths),
      },
    };
    this.actor.opacity = 0;
    this.actor.visible = false;
    this.refresh(false);
  }

  private released(event: Clutter.Event): boolean {
    const [x, y] = event.get_coords();
    if (insideControl(global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y), this.actor)) return Clutter.EVENT_PROPAGATE;
    if (event.get_button() === Clutter.BUTTON_SECONDARY) this.handlers.menu(this.actor);
    else if (event.get_button() === Clutter.BUTTON_PRIMARY) this.handlers.click(this.actor);
    return Clutter.EVENT_STOP;
  }

  relayout(layout: ElementLayout): void {
    this.layout = layout;
    this.refresh(false);
  }

  /** Builds the views again from what the extension describes, and moves to their size. */
  refresh(animate = true): void {
    const state = this.state();
    const content = this.handlers.run(() => state.content(this.layout));
    if (content) this.compact.show(content);
    const expanded = state.expanded && this.handlers.run(() => state.expanded!(this.layout));
    if (expanded) this.grown.show(expanded);
    this.sync(animate);
  }

  private along(view: RenderedView): number {
    const node = this.actor.get_theme_node();
    if (this.layout.vertical) return view.actor.get_preferred_height(this.layout.thickness)[1] + node.get_vertical_padding();
    return view.actor.get_preferred_width(-1)[1] + node.get_horizontal_padding();
  }

  private sync(animate: boolean): void {
    if (!this.actor.get_stage()) {
      this.syncOnceOnStage();
      return;
    }
    const state = this.state();
    const growing = this.actor.hover && !!state.expanded && state.shown;
    if (growing !== this.growing) {
      this.growing = growing;
      this.handlers.expanded(growing);
      this.crossfade(growing ? this.grown : this.compact, growing ? this.compact : this.grown, animate);
    }
    const size = state.shown ? this.along(growing ? this.grown : this.compact) : 0;
    const across = this.layout.thickness;
    const [width, height] = this.layout.vertical ? [across, size] : [size, across];
    if (state.shown && !this.shown) this.actor.show();
    const was = this.shown;
    this.shown = state.shown;
    if (!animate) {
      this.actor.remove_all_transitions();
      this.actor.set_size(width, height);
      this.actor.opacity = state.shown ? 255 : 0;
      this.actor.visible = state.shown;
      return;
    }
    animateActor(this.actor, {
      width, height, opacity: state.shown ? 255 : 0, ...GROW,
      onStopped: () => {
        if (!this.shown) this.actor.hide();
      },
    });
    if (state.shown && !was) this.actor.set_size(this.layout.vertical ? across : 0, this.layout.vertical ? 0 : across);
  }

  private crossfade(into: RenderedView, from: RenderedView, animate: boolean): void {
    into.actor.show();
    animateActor(into.actor, { opacity: 255, ...FADE, duration: animate ? FADE.duration : 0 });
    animateActor(from.actor, {
      opacity: 0, ...FADE, duration: animate ? FADE.duration : 0,
      onStopped: () => {
        if (from.actor.opacity === 0) from.actor.hide();
      },
    });
  }

  private syncOnceOnStage(): void {
    this.waiting ||= GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
      this.waiting = 0;
      this.sync(false);
      return GLib.SOURCE_REMOVE;
    });
  }

  destroy(): void {
    if (this.waiting) GLib.source_remove(this.waiting);
    this.actor.destroy();
  }
}
