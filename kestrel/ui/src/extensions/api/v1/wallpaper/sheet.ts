import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';

import type { Monitor } from '../../../../desktop/panel/panel.js';
import type { Rect } from '../types.js';

export function layerSnippet(declarations: string, shader: string): Cogl.Snippet {
  const snippet = Cogl.Snippet.new(Cogl.SnippetHook.FRAGMENT, `uniform vec2 layer_size;\nuniform vec4 layer_area;\n${declarations}\n`, null);
  snippet.set_replace(`vec2 layer_position = layer_area.xy + cogl_tex_coord_in[0].xy * layer_area.zw;
vec4 layer_color = vec4(0.0);
{
${shader}
}
cogl_color_out = layer_color;
`);
  return snippet;
}

const SheetActor = GObject.registerClass(class ExtensionLayerSheet extends Clutter.Actor {
  private readonly pipeline: Cogl.Pipeline;
  private readonly locations = new Map<string, number>();

  constructor(snippet: Cogl.Snippet) {
    super({ reactive: false });
    const context = global.stage.context.get_backend().get_cogl_context();
    this.pipeline = Cogl.Pipeline.new(context);
    this.pipeline.set_layer_texture(0, Cogl.Texture2D.new_with_size(context, 1, 1));
    this.pipeline.add_snippet(snippet);
  }

  uniform(name: string, components: number, values: readonly number[]): void {
    let location = this.locations.get(name);
    if (location === undefined) this.locations.set(name, location = this.pipeline.get_uniform_location(name));
    if (components === 1 && values.length === 1) this.pipeline.set_uniform_1f(location, values[0]);
    else this.pipeline.set_uniform_float(location, components, values.length / components, [...values]);
  }

  vfunc_paint_node(root: Clutter.PaintNode): void {
    const node = Clutter.PipelineNode.new(this.pipeline);
    root.add_child(node);
    node.add_rectangle(Clutter.ActorBox.new(0, 0, this.width, this.height));
  }
});

/** One display's share of a layer. */
export class Sheet {
  readonly actor: InstanceType<typeof SheetActor>;
  destroyed = false;

  constructor(readonly monitor: Monitor, readonly primary: boolean, area: Rect, snippet: Cogl.Snippet, name: string) {
    this.actor = new SheetActor(snippet);
    this.actor.name = name;
    this.actor.connect('destroy', () => (this.destroyed = true));
    this.actor.set_position(monitor.x + area.x, monitor.y + area.y);
    this.actor.set_size(area.width, area.height);
    this.actor.uniform('layer_size', 2, [monitor.width, monitor.height]);
    this.actor.uniform('layer_area', 4, [area.x, area.y, area.width, area.height]);
  }

  destroy(): void {
    if (!this.destroyed) this.actor.destroy();
  }
}
