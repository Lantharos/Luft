import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';
import St from 'gi://St';

import type { ApiContext } from '../context.js';
import type { EffectSurface, SurfaceOverlayOptions } from '../types.js';
import type { SurfaceAnchor } from '../../../host.js';
import { Effect } from './effect.js';
import { compileError, outlineSnippet, pipelineContext, Uniforms } from './shaders.js';
import type { EffectsStage } from './stage.js';

/** Adds a little shading on top of what an actor paints, with no offscreen target and no change to its layout. */
const SurfaceShading = GObject.registerClass(class ExtensionSurfaceShading extends Clutter.Effect {
  private pipeline!: Cogl.Pipeline;
  private radius: number | undefined;

  shade(snippet: Cogl.Snippet, uniforms: Uniforms, radius: number | undefined): void {
    const context = pipelineContext();
    this.pipeline = Cogl.Pipeline.new(context);
    this.pipeline.set_layer_texture(0, Cogl.Texture2D.new_with_size(context, 1, 1));
    this.pipeline.add_snippet(snippet);
    uniforms.applyTo(this.pipeline);
    this.radius = radius;
  }

  uniform(name: string, components: number, values: readonly number[]): void {
    this.pipeline.set_uniform_float(this.pipeline.get_uniform_location(name), components, values.length / components, [...values]);
    this.queue_repaint();
  }

  vfunc_paint_node(root: Clutter.PaintNode, _context: Clutter.PaintContext, _flags: Clutter.EffectPaintFlags): void {
    const actor = this.get_actor();
    root.add_child(Clutter.ActorNode.new(actor, -1));
    const [width, height] = actor.get_size();
    const radius = Math.min(this.radius ?? (actor as St.Widget).get_theme_node().get_border_radius(St.Corner.TOPLEFT), width / 2, height / 2);
    this.pipeline.set_uniform_float(this.pipeline.get_uniform_location('outline_size'), 2, 1, [width, height]);
    this.pipeline.set_uniform_float(this.pipeline.get_uniform_location('outline_radii'), 4, 1, [radius, radius, radius, radius]);
    this.pipeline.set_uniform_float(this.pipeline.get_uniform_location('outline_scale'), 1, 1, [actor.get_resource_scale()]);
    const node = Clutter.PipelineNode.new(this.pipeline);
    root.add_child(node);
    node.add_texture_rectangle(Clutter.ActorBox.new(0, 0, width, height), 0, 0, width, height);
  }
});

type Shading = InstanceType<typeof SurfaceShading>;

/** Lines or a shimmer over Kestrel's own surfaces, without touching how they're laid out or what's in them. */
export class SurfaceOverlay extends Effect {
  readonly cost = 0;
  private readonly snippet: Cogl.Snippet;
  private readonly uniforms = new Uniforms();
  private readonly shadings = new Map<Clutter.Actor, Shading>();
  private unwatch: (() => void) | null = null;

  constructor(stage: EffectsStage, context: ApiContext, private readonly overlayOptions: SurfaceOverlayOptions) {
    const snippet = outlineSnippet(overlayOptions.declarations ?? '', overlayOptions.shader);
    super(stage, context, overlayOptions);
    this.snippet = snippet;
    this.begin(compileError(snippet));
  }

  get attached(): boolean {
    return this.shadings.size > 0;
  }

  private anchors(): SurfaceAnchor[] {
    return this.overlayOptions.surfaces.flatMap((surface: EffectSurface) => this.context.host.surfaceAnchors(surface));
  }

  sync(): void {
    const wanted = this.allowed ? this.anchors() : [];
    for (const [actor, shading] of [...this.shadings]) {
      if (wanted.some(anchor => anchor.actor === actor)) continue;
      actor.remove_effect(shading);
      this.shadings.delete(actor);
    }
    for (const { actor, radius } of wanted) {
      if (this.shadings.has(actor)) continue;
      const shading = new SurfaceShading();
      shading.shade(this.snippet, this.uniforms, radius);
      actor.add_effect(shading);
      this.shadings.set(actor, shading);
      actor.connect('destroy', () => this.shadings.delete(actor));
    }
    if (this.allowed && !this.unwatch) this.unwatch = this.context.host.watchSurfaceAnchors(() => this.sync());
    this.keepTime(this.attached);
    this.stage.attachedChanged();
  }

  protected tick(time: number): void {
    this.set('outline_time', time);
  }

  set(name: string, ...values: number[]): void {
    this.uniforms.set(name, values.length, values);
    for (const shading of this.shadings.values()) shading.uniform(name, values.length, values);
  }

  protected detach(): void {
    this.unwatch?.();
    this.unwatch = null;
    for (const [actor, shading] of this.shadings) actor.remove_effect(shading);
    this.shadings.clear();
  }
}
