import Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import Mtk from 'gi://Mtk';

import type { ApiContext } from '../context.js';
import type { DesktopFilter as DesktopFilterApi, DesktopFilterOptions, FilterPass } from '../types.js';
import { Effect } from './effect.js';
import { compileError, filterSnippet, Uniforms } from './shaders.js';
import type { EffectsStage } from './stage.js';

const FULL_SIZE = 1;

function compiled(passes: readonly FilterPass[]): { snippets: Cogl.Snippet[]; error: string | null } {
  const snippets = passes.map(pass => filterSnippet(pass.declarations ?? '', pass.shader));
  const error = snippets.map((snippet, index) => compileError(snippet, index + 1)).find(problem => problem !== null) ?? null;
  return { snippets, error };
}

function monitorOf(view: Clutter.StageView): number {
  const layout = new Mtk.Rectangle();
  view.get_layout(layout);
  return global.display.get_monitor_index_for_rect(layout);
}

/** A chain of shaders over each display. The views keep what they painted, so the chain only costs a pass over the display. */
export class DesktopFilter extends Effect implements DesktopFilterApi {
  readonly cost = 3;
  private passes: readonly FilterPass[];
  private snippets: Cogl.Snippet[];
  private readonly filters = new Map<Clutter.StageView, Clutter.ViewFilter>();
  private readonly uniforms = new Uniforms();
  private cursorHeld = false;

  constructor(stage: EffectsStage, context: ApiContext, private readonly filterOptions: DesktopFilterOptions) {
    const { snippets, error } = compiled(filterOptions.passes);
    super(stage, context, filterOptions);
    this.passes = filterOptions.passes;
    this.snippets = snippets;
    this.begin(error);
  }

  get attached(): boolean {
    return this.filters.size > 0;
  }

  private shownOn(view: Clutter.StageView): boolean {
    return this.allowed && (!!this.filterOptions.fullscreen || !global.display.get_monitor_in_fullscreen(monitorOf(view)));
  }

  private build(view: Clutter.StageView): Clutter.ViewFilter {
    const filter = new Clutter.ViewFilter();
    this.passes.forEach((pass, index) => filter.add_pass(this.snippets[index], pass.scale ?? FULL_SIZE));
    const framebuffer = view.get_onscreen();
    filter.set_uniform('filter_size', 2, [framebuffer.get_width(), framebuffer.get_height()]);
    filter.set_uniform('filter_scale', 1, [view.get_scale()]);
    this.uniforms.forEach((name, components, values) => filter.set_uniform(name, components, values));
    filter.set_captured(!!this.filterOptions.captured);
    return filter;
  }

  sync(): void {
    const views = global.stage.peek_stage_views();
    for (const view of [...this.filters.keys()]) {
      if (views.includes(view) && this.shownOn(view)) continue;
      if (views.includes(view)) this.takeOff(view);
      this.filters.delete(view);
    }
    for (const view of views) {
      if (!this.shownOn(view)) continue;
      const filter = this.filters.get(view) ?? this.build(view);
      this.filters.set(view, filter);
      if (!view.get_filter()) view.set_filter(filter);
    }
    this.holdCursor(this.attached && !!this.filterOptions.warps);
    this.keepTime(this.attached);
    this.stage.attachedChanged();
  }

  /** A filter that bends the picture needs the pointer in it, or it stops pointing at what it's over. */
  private holdCursor(held: boolean): void {
    if (held === this.cursorHeld) return;
    this.cursorHeld = held;
    if (held) global.backend.inhibit_hw_cursor();
    else global.backend.uninhibit_hw_cursor();
  }

  protected tick(time: number): void {
    this.set('filter_time', time);
  }

  set(name: string, ...values: number[]): void {
    this.uniforms.set(name, values.length, values);
    for (const [view, filter] of this.filters) {
      filter.set_uniform(name, values.length, values);
      view.queue_filter_frame();
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
    for (const view of this.filters.keys()) {
      const filter = this.build(view);
      this.filters.set(view, filter);
      view.set_filter(filter);
    }
  }

  setCaptured(captured: boolean): void {
    this.filterOptions.captured = captured;
    for (const filter of this.filters.values()) filter.set_captured(captured);
  }

  private takeOff(view: Clutter.StageView): void {
    if (view.get_filter() === this.filters.get(view)) view.set_filter(null);
  }

  protected detach(): void {
    for (const view of this.filters.keys()) this.takeOff(view);
    this.filters.clear();
    this.holdCursor(false);
  }
}
