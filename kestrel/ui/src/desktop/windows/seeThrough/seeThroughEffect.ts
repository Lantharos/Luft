import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';

const DECLARATIONS = `
uniform sampler2D tex;
uniform vec4 frame;
uniform vec2 margin;
uniform float opacity;
uniform float keep_text;

vec3 unpremultiplied(vec4 color) {
  return color.a > 0.0 ? color.rgb / color.a : vec3(0.0);
}

vec3 sampled(vec2 position) {
  return unpremultiplied(texture2D(tex, position));
}

float spread(vec3 color, vec3 a, vec3 b, vec3 c) {
  return distance(color, a) + distance(color, b) + distance(color, c);
}`;

const SOURCE = `
vec2 low = frame.xy + margin;
vec2 high = frame.zw - margin;
float middle = mix(low.y, high.y, 0.5);
vec3 a = sampled(vec2(low.x, high.y));
vec3 b = sampled(vec2(high.x, high.y));
vec3 c = sampled(vec2(low.x, middle));
vec3 d = sampled(vec2(high.x, middle));
float sa = spread(a, b, c, d);
float sb = spread(b, a, c, d);
float sc = spread(c, a, b, d);
float sd = spread(d, a, b, c);
vec3 background = sa <= min(sb, min(sc, sd)) ? a : sb <= min(sc, sd) ? b : sc <= sd ? c : d;
float solid = keep_text * smoothstep(0.06, 0.22, distance(unpremultiplied(cogl_color_out), background));
cogl_color_out *= mix(opacity, 1.0, solid);`;

const SAMPLE_MARGIN = 6;

/** Lets what's behind a window show through its background, keeping what differs from the background, such as text, solid. */
export class SeeThroughEffect extends Clutter.ShaderEffect {
  static {
    GObject.registerClass(this);
  }

  constructor() {
    super();
    const texture = new GObject.Value();
    texture.init(GObject.TYPE_INT);
    texture.set_int(0);
    this.set_uniform_value('tex', texture);
  }

  vfunc_get_static_snippet(): Cogl.Snippet {
    return Cogl.Snippet.new(Cogl.SnippetHook.FRAGMENT, DECLARATIONS, SOURCE);
  }

  /** Where the window's own frame sits in its buffer, which also holds its shadows, in pixels. */
  setFrame(x: number, y: number, width: number, height: number, bufferWidth: number, bufferHeight: number): void {
    this.set_uniform_float('frame', 4, [x / bufferWidth, y / bufferHeight, (x + width) / bufferWidth, (y + height) / bufferHeight]);
    this.set_uniform_float('margin', 2, [SAMPLE_MARGIN / bufferWidth, SAMPLE_MARGIN / bufferHeight]);
    this.queue_repaint();
  }

  setLook(opacity: number, keepText: boolean): void {
    this.set_uniform_float('opacity', 1, [opacity]);
    this.set_uniform_float('keep_text', 1, [keepText ? 1 : 0]);
    this.queue_repaint();
  }
}
