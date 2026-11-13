import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';
import type Mtk from 'gi://Mtk';

import type { WallpaperPiece } from '../../../core/stage/background/wallpaperFrost.js';

const ROUNDED_CORNERS = Cogl.Snippet.new(Cogl.SnippetHook.FRAGMENT, 'uniform vec4 frame_in_texture; uniform vec2 frame_size; uniform float corner_radius;', `
  vec2 position = (cogl_tex_coord_in[0].xy - frame_in_texture.xy) / (frame_in_texture.zw - frame_in_texture.xy) * frame_size;
  vec2 inset = abs(position - frame_size * 0.5) - (frame_size * 0.5 - corner_radius);
  float outside = length(max(inset, 0.0)) + min(max(inset.x, inset.y), 0.0) - corner_radius;
  cogl_color_out *= clamp(0.5 - outside, 0.0, 1.0);
`);

interface Placed {
  pipeline: Cogl.Pipeline;
  box: Clutter.ActorBox;
  coords: [number, number, number, number];
}

function overlap(frame: Mtk.Rectangle, { x, y, width, height }: WallpaperPiece['monitor']): [number, number, number, number] | null {
  const left = Math.max(frame.x, x);
  const top = Math.max(frame.y, y);
  const right = Math.min(frame.x + frame.width, x + width);
  const bottom = Math.min(frame.y + frame.height, y + height);
  return right > left && bottom > top ? [left, top, right, bottom] : null;
}

export class WallpaperBackdrop extends Clutter.Actor {
  static {
    GObject.registerClass(this);
  }

  private readonly cogl = global.stage.context.get_backend().get_cogl_context();
  private pipelines = new Map<Cogl.Texture, Cogl.Pipeline>();
  private placed: Placed[] = [];
  private readonly paintColor = new Cogl.Color();
  private paintedOpacity = -1;

  get covered(): boolean {
    return this.placed.length > 0;
  }

  cover(pieces: WallpaperPiece[], frame: Mtk.Rectangle, radius: number): void {
    const pipelines = new Map(pieces.map(({ texture }) => [texture, this.pipelines.get(texture) ?? this.pipeline(texture)]));
    this.pipelines = pipelines;
    const scale = this.get_resource_scale();
    const cornerRadius = Math.min(radius, frame.width / 2, frame.height / 2) * scale;
    this.placed = pieces.flatMap(({ monitor, texture }) => {
      const area = overlap(frame, monitor);
      if (!area) return [];
      const [left, top, right, bottom] = area;
      const pipeline = pipelines.get(texture)!;
      const across = (value: number) => (value - monitor.x) / monitor.width;
      const down = (value: number) => (value - monitor.y) / monitor.height;
      pipeline.set_uniform_float(pipeline.get_uniform_location('frame_in_texture'), 4, 1,
        [across(frame.x), down(frame.y), across(frame.x + frame.width), down(frame.y + frame.height)]);
      pipeline.set_uniform_float(pipeline.get_uniform_location('frame_size'), 2, 1, [frame.width * scale, frame.height * scale]);
      pipeline.set_uniform_1f(pipeline.get_uniform_location('corner_radius'), cornerRadius);
      const box = new Clutter.ActorBox({ x1: left - frame.x, y1: top - frame.y, x2: right - frame.x, y2: bottom - frame.y });
      return [{ pipeline, box, coords: [across(left), down(top), across(right), down(bottom)] }];
    });
    this.queue_redraw();
  }

  private pipeline(texture: Cogl.Texture): Cogl.Pipeline {
    const pipeline = Cogl.Pipeline.new(this.cogl);
    pipeline.set_layer_texture(0, texture);
    pipeline.set_layer_filters(0, Cogl.PipelineFilter.LINEAR, Cogl.PipelineFilter.LINEAR);
    pipeline.set_layer_wrap_mode(0, Cogl.PipelineWrapMode.CLAMP_TO_EDGE);
    pipeline.add_snippet(ROUNDED_CORNERS);
    pipeline.set_color(this.paintColor);
    return pipeline;
  }

  vfunc_paint_node(root: Clutter.PaintNode): void {
    const opacity = this.get_paint_opacity() / 255;
    if (opacity !== this.paintedOpacity) {
      this.paintedOpacity = opacity;
      this.paintColor.init_from_4f(opacity, opacity, opacity, opacity);
      for (const pipeline of this.pipelines.values()) pipeline.set_color(this.paintColor);
    }
    for (const { pipeline, box, coords } of this.placed) {
      const node = Clutter.PipelineNode.new(pipeline);
      node.add_texture_rectangle(box, ...coords);
      root.add_child(node);
    }
  }
}
