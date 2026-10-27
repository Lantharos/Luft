import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';
import St from 'gi://St';

import type { EaseOptions } from '../../environment.js';

export const DEFAULT_FADE_FACTOR = 0.4;
export const VIGNETTE_BRIGHTNESS = 0.5;
export const VIGNETTE_SHARPNESS = 0.7;

const VIGNETTE_DECLARATIONS = `
uniform float brightness;
uniform float vignette_sharpness;
float rand(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}
`;

const VIGNETTE_CODE = `
cogl_color_out.a = cogl_color_in.a;
cogl_color_out.rgb = vec3(0.0, 0.0, 0.0);
vec2 position = cogl_tex_coord_in[0].xy - 0.5;
float t = clamp(length(1.41421 * position), 0.0, 1.0);
float pixel_brightness = mix(1.0, 1.0 - vignette_sharpness, t);
cogl_color_out.a *= 1.0 - pixel_brightness * brightness;
float noise = 2.0 * rand(position + 0.5) - 1.0;
noise = sign(noise) * (1.0 - sqrt(1.0 - abs(noise)));
cogl_color_out.a += noise / ((1.0 - cogl_color_out.a) * 255.0);
`;

class RadialShaderEffect extends Clutter.ShaderEffect {
  static [GObject.properties] = {
    'brightness': GObject.ParamSpec.float('brightness', null, null, GObject.ParamFlags.READWRITE, 0, 1, 1),
    'sharpness': GObject.ParamSpec.float('sharpness', null, null, GObject.ParamFlags.READWRITE, 0, 1, 0),
  };

  static {
    GObject.registerClass(this);
  }

  private brightnessValue?: number;
  private sharpnessValue?: number;

  constructor(properties: Partial<Clutter.ShaderEffect.ConstructorProps>) {
    super(properties);

    this.brightness = 1.0;
    this.sharpness = 0.0;
  }

  vfunc_get_static_snippet(): Cogl.Snippet {
    const snippet = Cogl.Snippet.new(Cogl.SnippetHook.FRAGMENT, VIGNETTE_DECLARATIONS, null);
    snippet.set_replace(VIGNETTE_CODE);
    return snippet;
  }

  get brightness(): number | undefined {
    return this.brightnessValue;
  }

  set brightness(value: number) {
    if (this.brightnessValue === value) return;
    this.brightnessValue = value;
    this.set_uniform_float('brightness', 1, [value]);
    this.notify('brightness');
  }

  get sharpness(): number | undefined {
    return this.sharpnessValue;
  }

  set sharpness(value: number) {
    if (this.sharpnessValue === value) return;
    this.sharpnessValue = value;
    this.set_uniform_float('vignette_sharpness', 1, [value]);
    this.notify('sharpness');
  }
}

export interface LightboxOptions {
  inhibitEvents?: boolean;
  width?: number;
  height?: number;
  fadeFactor?: number;
  radialEffect?: boolean;
}

export const Lightbox = GObject.registerClass({
  Properties: {
    'active': GObject.ParamSpec.boolean('active', null, null, GObject.ParamFlags.READABLE, false),
  },
}, class Lightbox extends St.Bin {
  declare private isActive: boolean;
  declare private container: Clutter.Actor;
  declare private stack: Clutter.Actor[];
  declare private fadeFactor: number;
  declare private radialEffect: boolean;
  declare private highlighted: Clutter.Actor | null;

  _init(container: Clutter.Actor, {
    inhibitEvents = false,
    width,
    height,
    fadeFactor = DEFAULT_FADE_FACTOR,
    radialEffect = false,
  }: LightboxOptions = {}): void {
    const fixedSize = width && height ? { width, height } : null;
    super._init({ reactive: inhibitEvents, visible: false, ...fixedSize });

    this.isActive = false;
    this.container = container;
    this.stack = container.get_children();
    this.fadeFactor = fadeFactor;
    this.radialEffect = radialEffect;
    this.highlighted = null;

    if (radialEffect) this.add_effect(new RadialShaderEffect({ name: 'radial' }));
    else this.set({ opacity: 0, style_class: 'lightbox' });

    container.add_child(this);
    container.set_child_above_sibling(this, null);

    this.connect('destroy', () => this.highlight(null));

    if (!fixedSize) {
      this.add_constraint(new Clutter.BindConstraint({
        source: container,
        coordinate: Clutter.BindCoordinate.ALL,
      }));
    }

    container.connectObject(
      'child-added', (_container: Clutter.Actor, child: Clutter.Actor) => this.childAdded(child),
      'child-removed', (_container: Clutter.Actor, child: Clutter.Actor) => this.childRemoved(child),
      this);
  }

  get active(): boolean {
    return this.isActive;
  }

  private childAdded(newChild: Clutter.Actor): void {
    const children = this.container.get_children();
    const myIndex = children.indexOf(this);
    const newChildIndex = children.indexOf(newChild);

    if (newChildIndex > myIndex) {
      this.container.set_child_above_sibling(this, newChild);
      this.stack.push(newChild);
    } else if (newChildIndex === 0) {
      this.stack.unshift(newChild);
    } else {
      const prevChild = this.stack.indexOf(children[newChildIndex - 1]);
      if (prevChild !== -1) this.stack.splice(prevChild + 1, 0, newChild);
    }
  }

  lightOn(fadeInTime = 0): void {
    this.remove_all_transitions();

    const easeOptions: EaseOptions = { duration: fadeInTime, mode: Clutter.AnimationMode.EASE_OUT_QUAD };
    const onComplete = () => {
      this.isActive = true;
      this.notify('active');
    };

    this.show();

    if (this.radialEffect) {
      this.ease_property('@effects.radial.brightness', VIGNETTE_BRIGHTNESS, easeOptions);
      this.ease_property('@effects.radial.sharpness', VIGNETTE_SHARPNESS, { onComplete, ...easeOptions });
    } else {
      this.ease({ ...easeOptions, opacity: 255 * this.fadeFactor, onComplete });
    }
  }

  lightOff(fadeOutTime = 0): void {
    this.remove_all_transitions();

    this.isActive = false;
    this.notify('active');

    const easeOptions: EaseOptions = { duration: fadeOutTime, mode: Clutter.AnimationMode.EASE_OUT_QUAD };
    const onComplete = () => this.hide();

    if (this.radialEffect) {
      this.ease_property('@effects.radial.brightness', 1.0, easeOptions);
      this.ease_property('@effects.radial.sharpness', 0.0, { onComplete, ...easeOptions });
    } else {
      this.ease({ ...easeOptions, opacity: 0, onComplete });
    }
  }

  private childRemoved(child: Clutter.Actor): void {
    const index = this.stack.indexOf(child);
    if (index !== -1) this.stack.splice(index, 1);

    if (child === this.highlighted) this.highlighted = null;
  }

  highlight(window: Clutter.Actor | null): void {
    if (this.highlighted === window) return;

    let below: Clutter.Actor = this;
    for (const child of this.stack.toReversed()) {
      if (child === window) this.container.set_child_above_sibling(child, null);
      else if (child === this.highlighted) this.container.set_child_below_sibling(child, below);
      else below = child;
    }

    this.highlighted = window;
  }
});
export type Lightbox = InstanceType<typeof Lightbox>;
