import Cogl from 'gi://Cogl';

const OUTLINE = `
uniform vec2 outline_size;
uniform vec4 outline_radii;
uniform float outline_scale;
uniform float outline_time;
uniform float outline_margin;

float outline_distance(vec2 point) {
  vec2 middle = outline_size * 0.5;
  vec2 from_middle = point - middle;
  float radius = from_middle.y < 0.0 ? (from_middle.x < 0.0 ? outline_radii.x : outline_radii.y) : (from_middle.x < 0.0 ? outline_radii.w : outline_radii.z);
  vec2 corner = abs(from_middle) - middle + radius;
  return length(max(corner, 0.0)) + min(max(corner.x, corner.y), 0.0) - radius;
}

float outline_inside(vec2 point) {
  return clamp(0.5 - outline_distance(point) * outline_scale, 0.0, 1.0);
}
`;

const WINDOW = `
uniform sampler2D window_texture;
uniform vec2 window_size;
uniform vec4 window_frame;
uniform float window_time;
uniform float window_progress;

vec4 window_sample(vec2 position) {
  return texture2D(window_texture, position);
}

float window_inside(vec2 position) {
  vec2 edges = step(window_frame.xy, position) * step(position, window_frame.xy + window_frame.zw);
  return edges.x * edges.y;
}
`;

const FILTER = `
uniform vec2 filter_size;
uniform float filter_time;

vec4 filter_scene(vec2 position) {
  return texture2D(cogl_sampler0, position);
}
`;

export const pipelineContext = (): Cogl.Context => global.stage.context.get_backend().get_cogl_context();

function replacing(declarations: string, body: string): Cogl.Snippet {
  const snippet = Cogl.Snippet.new(Cogl.SnippetHook.FRAGMENT, declarations, null);
  snippet.set_replace(body);
  return snippet;
}

/** Runs over a window's own pixels: `window_uv` and `window_color` come in, `window_color` goes out. */
export const windowSnippet = (declarations: string, shader: string): Cogl.Snippet => replacing(`${WINDOW}${declarations}\n`, `
vec2 window_uv = cogl_tex_coord_in[0].xy;
vec4 window_color = window_sample(window_uv);
{
${shader}
}
cogl_color_out = window_color * cogl_color_in;
`);

/** Draws over a window or one of Kestrel's surfaces, without reading it: `outline_position` comes in, `outline_color` goes out, premultiplied. */
export const outlineSnippet = (declarations: string, shader: string): Cogl.Snippet => replacing(`${OUTLINE}${declarations}\n`, `
vec2 outline_position = cogl_tex_coord_in[0].xy;
vec4 outline_color = vec4(0.0);
{
${shader}
}
cogl_color_out = outline_color * cogl_color_in.a;
`);

/** One pass of a filter over a display: `filter_uv` and `filter_color` come in, `filter_color` goes out. */
export const filterSnippet = (declarations: string, shader: string): Cogl.Snippet => replacing(`${FILTER}${declarations}\n`, `
vec2 filter_uv = cogl_tex_coord_in[0].xy;
vec4 filter_color = filter_scene(filter_uv);
{
${shader}
}
cogl_color_out = filter_color;
`);

/** Compiles `snippet` as it will run, on a pipeline with `layers` layers, and says what the driver refused, if anything. */
export function compileError(snippet: Cogl.Snippet, layers = 1): string | null {
  const context = pipelineContext();
  const target = Cogl.Offscreen.new_with_texture(Cogl.Texture2D.new_with_size(context, 1, 1));
  target.allocate();
  const pipeline = Cogl.Pipeline.new(context);
  for (let layer = 0; layer < layers; layer++) pipeline.set_layer_texture(layer, Cogl.Texture2D.new_with_size(context, 1, 1));
  pipeline.add_snippet(snippet);
  target.draw_rectangle(pipeline, -1, -1, 1, 1);
  target.flush();
  return context.take_shader_error();
}

/** The uniforms of something a shader runs on, kept so a pipeline made later starts with them. */
export class Uniforms {
  private readonly values = new Map<string, { components: number; values: number[] }>();

  set(name: string, components: number, values: readonly number[]): void {
    this.values.set(name, { components, values: [...values] });
  }

  applyTo(pipeline: Cogl.Pipeline): void {
    for (const [name, { components, values }] of this.values)
      pipeline.set_uniform_float(pipeline.get_uniform_location(name), components, values.length / components, values);
  }

  forEach(each: (name: string, components: number, values: number[]) => void): void {
    for (const [name, { components, values }] of this.values) each(name, components, values);
  }
}
