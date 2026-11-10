import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';
import type Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';

import type { ApiContext } from '../../../core/context.js';
import type { EffectWindow, WindowOverlayOptions } from '../../../types.js';
import { cornerRadii } from '../../wallpaper/windows.js';
import { Effect } from '../effect.js';
import { compileError, outlineSnippet, pipelineContext, Uniforms } from '../shaders.js';
import type { EffectsStage } from '../stage.js';
import { type Attachment, FrameInBuffer, type WindowEffect } from './tracker.js';

const LARGEST_CORNER_ARC_DEPTH = 5;

type Strip = [x: number, y: number, width: number, height: number];

const OverlayActor = GObject.registerClass(class ExtensionWindowOverlay extends Clutter.Actor {
  private readonly pipeline: Cogl.Pipeline;
  private strips: Strip[] = [];
  private margin = 0;

  constructor(snippet: Cogl.Snippet, private readonly window: Meta.Window, private readonly frameInBuffer: FrameInBuffer) {
    super({ reactive: false });
    const context = pipelineContext();
    this.pipeline = Cogl.Pipeline.new(context);
    this.pipeline.set_layer_texture(0, Cogl.Texture2D.new_with_size(context, 1, 1));
    this.pipeline.add_snippet(snippet);
  }

  uniform(name: string, components: number, values: readonly number[]): void {
    this.pipeline.set_uniform_float(this.pipeline.get_uniform_location(name), components, values.length / components, [...values]);
  }

  shape(strips: Strip[], margin: number): void {
    this.strips = strips;
    this.margin = margin;
    this.queue_redraw();
  }

  redrawStrips(): void {
    for (const [x, y, width, height] of this.strips) this.queue_redraw_with_clip(new Mtk.Rectangle({ x, y, width, height }));
  }

  vfunc_paint_node(root: Clutter.PaintNode): void {
    this.uniform('outline_radii', 4, cornerRadii(this.window));
    this.frameInBuffer.check();
    const node = Clutter.PipelineNode.new(this.pipeline);
    root.add_child(node);
    for (const [x, y, width, height] of this.strips)
      node.add_texture_rectangle(Clutter.ActorBox.new(x, y, x + width, y + height), x - this.margin, y - this.margin, x + width - this.margin, y + height - this.margin);
  }
});

type Overlay = InstanceType<typeof OverlayActor>;

function stripsFor(width: number, height: number, margin: number, inset: number | undefined): Strip[] {
  if (inset === undefined) return [[0, 0, width, height]];
  const band = margin + inset + LARGEST_CORNER_ARC_DEPTH;
  return [
    [0, 0, width, band],
    [0, height - band, width, band],
    [0, band, band, height - band * 2],
    [width - band, band, band, height - band * 2],
  ];
}

class OverlaidWindow implements Attachment {
  private readonly overlay: Overlay;
  private readonly frameInBuffer: FrameInBuffer;

  constructor(private readonly owner: WindowOverlay, private readonly window: Meta.Window, actor: Meta.WindowActor) {
    this.frameInBuffer = new FrameInBuffer(window, () => this.place());
    this.overlay = new OverlayActor(owner.snippet, window, this.frameInBuffer);
    owner.shared.forEach((name, components, values) => this.overlay.uniform(name, components, values));
    actor.add_child(this.overlay);
    this.place();
  }

  place(): void {
    const { margin, inset } = this.owner.geometry;
    const frame = this.window.get_frame_rect();
    const buffer = this.window.get_buffer_rect();
    const width = frame.width + margin * 2;
    const height = frame.height + margin * 2;
    this.overlay.set_position(frame.x - buffer.x - margin, frame.y - buffer.y - margin);
    this.overlay.set_size(width, height);
    this.overlay.uniform('outline_size', 2, [frame.width, frame.height]);
    this.overlay.uniform('outline_margin', 1, [margin]);
    this.overlay.uniform('outline_scale', 1, [global.display.get_monitor_scale(this.window.get_monitor())]);
    this.overlay.shape(stripsFor(width, height, margin, inset), margin);
  }

  uniform(name: string, components: number, values: readonly number[]): void {
    this.overlay.uniform(name, components, values);
    this.overlay.redrawStrips();
  }

  detach(): void {
    this.frameInBuffer.destroy();
    this.overlay.destroy();
    this.owner.left(this);
  }
}

export class WindowOverlay extends Effect implements WindowEffect {
  readonly cost = 1;
  readonly snippet: Cogl.Snippet;
  readonly shared = new Uniforms();
  private readonly overlaid = new Set<OverlaidWindow>();

  constructor(stage: EffectsStage, context: ApiContext, private readonly overlayOptions: WindowOverlayOptions) {
    const snippet = outlineSnippet(overlayOptions.declarations ?? '', overlayOptions.shader);
    super(stage, context, overlayOptions);
    this.snippet = snippet;
    this.begin(compileError(snippet));
    if (!this.problem) stage.windows.add(this);
  }

  get geometry() {
    return { margin: this.overlayOptions.margin ?? 0, inset: this.overlayOptions.inset };
  }

  get attached(): boolean {
    return this.overlaid.size > 0;
  }

  get onFullscreen(): boolean {
    return !!this.overlayOptions.fullscreen;
  }

  get followsFocus(): boolean {
    return !!this.overlayOptions.followsFocus;
  }

  wants(window: EffectWindow): boolean {
    return this.allowed && !!this.context.scope.run(() => this.overlayOptions.match(window));
  }

  attach(window: Meta.Window, actor: Meta.WindowActor): Attachment {
    const overlaid = new OverlaidWindow(this, window, actor);
    this.overlaid.add(overlaid);
    this.keepTime(true);
    this.stage.attachedChanged();
    return overlaid;
  }

  left(overlaid: OverlaidWindow): void {
    this.overlaid.delete(overlaid);
    this.keepTime(this.attached);
  }

  sync(): void {}

  protected tick(time: number): void {
    this.set('outline_time', time);
  }

  set(name: string, ...values: number[]): void {
    this.shared.set(name, values.length, values);
    for (const overlaid of this.overlaid) overlaid.uniform(name, values.length, values);
  }

  refresh(): void {
    this.stage.windows.sync();
  }

  protected detach(): void {
    this.stage.windows.remove(this);
  }
}
