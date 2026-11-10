import Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';
import type Meta from 'gi://Meta';

import type { ApiContext } from '../../../core/context.js';
import type { EffectWindow, WindowShaderOptions } from '../../../types.js';
import { Effect } from '../effect.js';
import { compileError, Uniforms, windowSnippet } from '../shaders.js';
import type { EffectsStage } from '../stage.js';
import { type Attachment, FrameInBuffer, surfacesOf, type WindowEffect } from './tracker.js';

const NAME = 'extension-window-shader';
let serial = 0;

export const WindowPixels = GObject.registerClass(class ExtensionWindowPixels extends Clutter.OffscreenEffect {
  private snippet!: Cogl.Snippet;
  private uniforms!: Uniforms;
  private painting: (() => void) | null = null;
  private pipeline: Cogl.Pipeline | null = null;

  shade(snippet: Cogl.Snippet, uniforms: Uniforms, painting: (() => void) | null = null): void {
    this.snippet = snippet;
    this.uniforms = uniforms;
    this.painting = painting;
  }

  vfunc_paint_target(node: Clutter.PaintNode, paintContext: Clutter.PaintContext): void {
    this.painting?.();
    const pipeline = this.get_pipeline()!;
    if (pipeline !== this.pipeline) {
      pipeline.add_snippet(this.snippet);
      pipeline.set_uniform_1i(pipeline.get_uniform_location('window_texture'), 0);
      this.uniforms.applyTo(pipeline);
      this.pipeline = pipeline;
    }
    super.vfunc_paint_target(node, paintContext);
  }

  uniform(name: string, components: number, values: readonly number[]): void {
    this.pipeline?.set_uniform_float(this.pipeline.get_uniform_location(name), components, values.length / components, [...values]);
    this.queue_repaint();
  }
});

export function frameUniforms(uniforms: Uniforms, window: Meta.Window): void {
  const frame = window.get_frame_rect();
  const buffer = window.get_buffer_rect();
  uniforms.set('window_size', 2, [frame.width, frame.height]);
  uniforms.set('window_frame', 4, [(frame.x - buffer.x) / buffer.width, (frame.y - buffer.y) / buffer.height, frame.width / buffer.width, frame.height / buffer.height]);
}

class ShadedWindow implements Attachment {
  private readonly name = `${NAME}-${serial++}`;
  private readonly effect = new WindowPixels();
  private readonly uniforms = new Uniforms();
  private surfaces: Clutter.Actor | null = null;
  private readonly surfaceSignals: number[];
  private readonly frameInBuffer: FrameInBuffer;

  constructor(private readonly owner: WindowShader, private readonly window: Meta.Window, private readonly actor: Meta.WindowActor) {
    this.frameInBuffer = new FrameInBuffer(window, () => this.place());
    this.effect.shade(owner.snippet, this.uniforms, () => this.frameInBuffer.check());
    owner.shared.forEach((name, components, values) => this.uniforms.set(name, components, values));
    frameUniforms(this.uniforms, window);
    this.surfaceSignals = (['child-added', 'child-removed'] as const).map(signal => actor.connect(signal, () => this.follow()));
    this.follow();
  }

  private follow(): void {
    const surfaces = surfacesOf(this.actor);
    if (surfaces === this.surfaces) return;
    this.surfaces?.remove_effect(this.effect);
    surfaces?.add_effect_with_name(this.name, this.effect);
    this.surfaces = surfaces;
  }

  uniform(name: string, components: number, values: readonly number[]): void {
    this.uniforms.set(name, components, values);
    this.effect.uniform(name, components, values);
  }

  place(): void {
    frameUniforms(this.uniforms, this.window);
    this.uniforms.forEach((name, components, values) => {
      if (name === 'window_size' || name === 'window_frame') this.effect.uniform(name, components, values);
    });
  }

  detach(): void {
    this.frameInBuffer.destroy();
    for (const signal of this.surfaceSignals) this.actor.disconnect(signal);
    this.surfaces?.remove_effect(this.effect);
    this.owner.left(this);
  }
}

export class WindowShader extends Effect implements WindowEffect {
  readonly cost = 2;
  readonly snippet: Cogl.Snippet;
  readonly shared = new Uniforms();
  private readonly shaded = new Set<ShadedWindow>();

  constructor(stage: EffectsStage, context: ApiContext, private readonly shaderOptions: WindowShaderOptions) {
    const snippet = windowSnippet(shaderOptions.declarations ?? '', shaderOptions.shader);
    super(stage, context, shaderOptions);
    this.snippet = snippet;
    this.begin(compileError(snippet));
    if (!this.problem) stage.windows.add(this);
  }

  get attached(): boolean {
    return this.shaded.size > 0;
  }

  get onFullscreen(): boolean {
    return !!this.shaderOptions.fullscreen;
  }

  get followsFocus(): boolean {
    return !!this.shaderOptions.followsFocus;
  }

  wants(window: EffectWindow): boolean {
    return this.allowed && !!this.context.scope.run(() => this.shaderOptions.match(window));
  }

  attach(window: Meta.Window, actor: Meta.WindowActor): Attachment {
    const shaded = new ShadedWindow(this, window, actor);
    this.shaded.add(shaded);
    this.keepTime(true);
    this.stage.attachedChanged();
    return shaded;
  }

  left(shaded: ShadedWindow): void {
    this.shaded.delete(shaded);
    this.keepTime(this.attached);
  }

  sync(): void {}

  protected tick(time: number): void {
    this.set('window_time', time);
  }

  set(name: string, ...values: number[]): void {
    this.shared.set(name, values.length, values);
    for (const shaded of this.shaded) shaded.uniform(name, values.length, values);
  }

  refresh(): void {
    this.stage.windows.sync();
  }

  protected detach(): void {
    this.stage.windows.remove(this);
  }
}
