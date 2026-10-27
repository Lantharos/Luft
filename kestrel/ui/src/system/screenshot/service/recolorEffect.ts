import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';

const DECLARATIONS = `
  vec3 rgb2yCrCb(vec3 c) {                                \n
    float y = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;    \n
    float cr = 0.7133 * (c.r - y);                        \n
    float cb = 0.5643 * (c.b - y);                        \n
    return vec3(y, cr, cb);                               \n
  }                                                       \n
                                                          \n
  uniform vec3 chroma_color;                              \n
  uniform vec3 recolor_color;                             \n
  uniform float threshold;                                \n
  uniform float smoothing;                                \n`;

const SOURCE = `
  vec3 mask = rgb2yCrCb(chroma_color.rgb);                \n
  vec3 yCrCb = rgb2yCrCb(cogl_color_out.rgb);             \n
  float blend =                                           \n
    smoothstep(threshold,                                 \n
               threshold + smoothing,                     \n
               distance(yCrCb.gb, mask.gb));              \n
  cogl_color_out.rgb =                                    \n
    mix(recolor_color, cogl_color_out.rgb, blend);        \n`;

export interface RecolorParams {
  chroma: Cogl.Color;
  threshold: number;
  smoothing: number;
}

export class RecolorEffect extends Clutter.ShaderEffect {
  static [GObject.properties] = {
    'color': GObject.ParamSpec.boxed('color', null, null, GObject.ParamFlags.WRITABLE, Cogl.Color.$gtype),
    'chroma': GObject.ParamSpec.boxed('chroma', null, null, GObject.ParamFlags.WRITABLE, Cogl.Color.$gtype),
    'threshold': GObject.ParamSpec.float('threshold', null, null, GObject.ParamFlags.WRITABLE, 0.0, 1.0, 0.0),
    'smoothing': GObject.ParamSpec.float('smoothing', null, null, GObject.ParamFlags.WRITABLE, 0.0, 1.0, 0.0),
  };

  static {
    GObject.registerClass(this);
  }

  declare private colorValue: Cogl.Color;
  declare private chromaValue: Cogl.Color;
  declare private thresholdValue: number;
  declare private smoothingValue: number;

  constructor(params: RecolorParams) {
    super(params as Partial<Clutter.ShaderEffect.ConstructorProps>);
  }

  _init(params: Partial<Clutter.ShaderEffect.ConstructorProps>): void {
    this.colorValue = new Cogl.Color();
    this.chromaValue = new Cogl.Color();
    this.thresholdValue = 0;
    this.smoothingValue = 0;

    super._init(params);

    this.updateColorUniform('recolor_color', this.colorValue);
    this.updateColorUniform('chroma_color', this.chromaValue);
    this.updateFloatUniform('threshold', this.thresholdValue);
    this.updateFloatUniform('smoothing', this.smoothingValue);
  }

  set color(color: Cogl.Color) {
    if (this.colorValue.equal(color)) return;

    this.colorValue = color;
    this.notify('color');
    this.updateColorUniform('recolor_color', color);
  }

  set chroma(color: Cogl.Color) {
    if (this.chromaValue.equal(color)) return;

    this.chromaValue = color;
    this.notify('chroma');
    this.updateColorUniform('chroma_color', color);
  }

  set threshold(value: number) {
    if (this.thresholdValue === value) return;

    this.thresholdValue = value;
    this.notify('threshold');
    this.updateFloatUniform('threshold', value);
  }

  set smoothing(value: number) {
    if (this.smoothingValue === value) return;

    this.smoothingValue = value;
    this.notify('smoothing');
    this.updateFloatUniform('smoothing', value);
  }

  vfunc_get_static_snippet(): Cogl.Snippet {
    return Cogl.Snippet.new(Cogl.SnippetHook.FRAGMENT, DECLARATIONS, SOURCE);
  }

  private updateColorUniform(name: string, color: Cogl.Color): void {
    this.set_uniform_float(name, 3, [color.red / 255, color.green / 255, color.blue / 255]);
    this.queue_repaint();
  }

  private updateFloatUniform(name: string, value: number): void {
    this.set_uniform_float(name, 1, [value]);
    this.queue_repaint();
  }
}
