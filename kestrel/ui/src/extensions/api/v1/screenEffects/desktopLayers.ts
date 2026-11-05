import Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import Shell from 'gi://Shell';

import type { ApiContext } from '../context.js';
import type { DesktopFilter as DesktopFilterApi, DesktopFilterOptions, FilterPass } from '../types.js';
import type { DesktopPicture } from '../../../host.js';
import { DesktopPointer } from './desktopPointer.js';
import { Effect } from './effect.js';
import { compileError, desktopLayerSnippet, Uniforms } from './shaders.js';
import type { EffectsStage } from './stage.js';

const FULL_SIZE = 1;

function compiled(passes: readonly FilterPass[]): { snippets: Cogl.Snippet[]; error: string | null } {
  const snippets = passes.map(pass => desktopLayerSnippet(pass.declarations ?? '', pass.shader));
  const error = snippets.map((snippet, index) => compileError(snippet, index + 1)).find(problem => problem !== null) ?? null;
  return { snippets, error };
}

interface Layer {
  effect: Shell.DesktopFilterEffect;
  filters: Map<Clutter.StageView, Clutter.ViewFilter>;
  underWindows: boolean;
}

/**
 * The same chain as a filter over the display, run over the wallpaper and the taskbar each on their own, so windows and
 * everything else between and above them stay as they are. Each piece keeps its picture until it changes.
 */
export class DesktopLayerFilter extends Effect implements DesktopFilterApi {
  readonly cost = 3;
  private passes: readonly FilterPass[];
  private snippets: Cogl.Snippet[];
  private readonly layers = new Map<Clutter.Actor, Layer>();
  private readonly uniforms = new Uniforms();
  private unwatch: (() => void) | null = null;
  private glassHeld = false;
  private pointer: DesktopPointer | null = null;

  constructor(stage: EffectsStage, context: ApiContext, private readonly filterOptions: DesktopFilterOptions) {
    const { snippets, error } = compiled(filterOptions.passes);
    super(stage, context, filterOptions);
    this.passes = filterOptions.passes;
    this.snippets = snippets;
    this.begin(error);
  }

  get attached(): boolean {
    return this.layers.size > 0;
  }

  private build(view: Clutter.StageView): Clutter.ViewFilter {
    const filter = new Clutter.ViewFilter();
    this.passes.forEach((pass, index) => filter.add_pass(this.snippets[index], pass.scale ?? FULL_SIZE));
    const framebuffer = view.get_framebuffer();
    filter.set_uniform('filter_size', 2, [framebuffer.get_width(), framebuffer.get_height()]);
    filter.set_uniform('filter_scale', 1, [view.get_scale()]);
    this.uniforms.forEach((name, components, values) => filter.set_uniform(name, components, values));
    return filter;
  }

  private addLayer({ actor, fillsView = false, underWindows = false }: DesktopPicture): void {
    const effect = new Shell.DesktopFilterEffect();
    effect.set_fills_view(fillsView);
    effect.set_reach(this.filterOptions.reach ?? 0);
    effect.set_captured(!!this.filterOptions.captured);
    actor.add_effect(effect);
    this.layers.set(actor, { effect, filters: new Map(), underWindows });
    actor.connect('destroy', () => this.layers.delete(actor));
  }

  private removeLayer(actor: Clutter.Actor, { effect }: Layer): void {
    actor.remove_effect(effect);
    this.layers.delete(actor);
  }

  private followViews({ effect, filters }: Layer): void {
    const views = global.stage.peek_stage_views();
    for (const view of [...filters.keys()]) {
      if (views.includes(view)) continue;
      effect.set_view_filter(view, null);
      filters.delete(view);
    }
    for (const view of views) {
      if (filters.has(view)) continue;
      const filter = this.build(view);
      filters.set(view, filter);
      effect.set_view_filter(view, filter);
    }
  }

  sync(): void {
    const wanted = this.allowed ? this.context.host.desktopPictures() : [];
    for (const [actor, layer] of [...this.layers])
      if (!wanted.some(picture => picture.actor === actor)) this.removeLayer(actor, layer);
    for (const picture of wanted) if (!this.layers.has(picture.actor)) this.addLayer(picture);
    for (const layer of this.layers.values()) this.followViews(layer);
    if (this.allowed && !this.unwatch) this.unwatch = this.context.host.watchDesktopPictures(() => this.sync());
    this.holdGlass(this.attached && !!this.filterOptions.warps);
    this.followPointer();
    this.keepTime(this.attached);
    this.stage.attachedChanged();
  }

  /** The taskbar's blur stays where the taskbar really is, so it can't follow a filter that bends the picture. */
  private holdGlass(held: boolean): void {
    if (held === this.glassHeld) return;
    this.glassHeld = held;
    this.context.host.holdTaskbarBlur(held);
  }

  private followPointer(): void {
    const { shownAt } = this.filterOptions;
    if (!this.attached) {
      this.pointer?.destroy();
      this.pointer = null;
    } else if (shownAt && !this.pointer) {
      const onDesktop = (actor: Clutter.Actor) => actor === global.stage || [...this.layers.keys()].some(layer => layer.contains(actor));
      const guarded = this.context.scope.guard(shownAt);
      this.pointer = new DesktopPointer(this.context.host, (x, y) => guarded(x, y) ?? [x, y], onDesktop);
    }
  }

  protected tick(time: number): void {
    this.set('filter_time', time);
  }

  set(name: string, ...values: number[]): void {
    this.uniforms.set(name, values.length, values);
    const uncovered = global.compositor.get_uncovered_region();
    for (const { effect, filters, underWindows } of this.layers.values()) {
      for (const filter of filters.values()) filter.set_uniform(name, values.length, values);
      effect.queue_frame(underWindows ? uncovered : null);
    }
  }

  setPasses(passes: readonly FilterPass[]): void {
    const { snippets, error } = compiled(passes);
    if (error !== null) {
      this.fail('shader', error);
      return;
    }
    this.passes = passes;
    this.snippets = snippets;
    for (const { effect, filters } of this.layers.values()) {
      for (const view of filters.keys()) {
        const filter = this.build(view);
        filters.set(view, filter);
        effect.set_view_filter(view, filter);
      }
    }
  }

  setCaptured(captured: boolean): void {
    this.filterOptions.captured = captured;
    for (const { effect } of this.layers.values()) effect.set_captured(captured);
  }

  protected detach(): void {
    this.unwatch?.();
    this.unwatch = null;
    for (const [actor, layer] of [...this.layers]) this.removeLayer(actor, layer);
    this.holdGlass(false);
    this.followPointer();
  }
}
