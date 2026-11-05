import type { Layer, LayerFrame, Wallpaper } from '@luft/extension-api';

import { Density, ease } from './density.js';
import type { Effect } from './effects/sky.js';
import { Parting } from './parting.js';
import { EFFECTS, type EffectName, type Scene } from './scene/scene.js';

const WIND_CHANGE_S = 4;

interface Drawn {
  effect: Effect;
  layer: Layer;
  density: Density;
  wind: number;
  drift: number;
  time: number;
}

const gusting = (time: number) => 1 + 0.35 * Math.sin(time * 0.21) + 0.15 * Math.sin(time * 0.73 + 1.3);

/**
 * One wallpaper layer for each effect, of which only the one showing and the one it takes over from are active. An
 * effect builds up when it starts and winds down when it stops, so switching between them crossfades.
 */
export class Sky {
  private readonly drawn = new Map<EffectName, Drawn>();
  private readonly parting: Parting;
  private scene: Scene | null = null;

  constructor(wallpaper: Wallpaper, effects: Record<EffectName, Effect>) {
    this.parting = new Parting(wallpaper);
    for (const name of EFFECTS) {
      const effect = effects[name];
      const layer = wallpaper.addLayer({
        declarations: effect.declarations,
        shader: effect.shader,
        active: false,
        depth: 'below-windows',
        atlases: effect.atlases,
        frame: frame => this.frame(name, frame),
      });
      this.drawn.set(name, { effect, layer, density: new Density(), wind: 0, drift: 0, time: 0 });
    }
  }

  layer(name: EffectName): Layer {
    return this.drawn.get(name)!.layer;
  }

  /** The effect falling now, or none. */
  get showing(): EffectName | null {
    return this.scene?.effect ?? null;
  }

  /** Shows `scene`, which moves aside for the pointer if `parts` says it may. */
  show(scene: Scene | null, parts: boolean): void {
    this.scene = scene;
    this.parting.allow(parts && !!scene && !!this.drawn.get(scene.effect)!.effect.parts);
    for (const [name, drawn] of this.drawn) {
      if (scene?.effect === name && !drawn.layer.active && drawn.density.dry) drawn.wind = scene.wind;
      drawn.layer.active = scene?.effect === name || !drawn.density.dry;
    }
  }

  private frame(name: EffectName, { time, elapsed, displays }: LayerFrame): void {
    const drawn = this.drawn.get(name)!;
    const target = this.scene?.effect === name ? this.scene : null;
    drawn.density.advance(target?.density ?? 0, time, elapsed);
    if (!target && drawn.density.dry) {
      drawn.density.stop();
      drawn.layer.active = false;
    }
    if (target) drawn.wind = ease(drawn.wind, target.wind, elapsed, WIND_CHANGE_S);
    const wind = drawn.wind * gusting(time);
    if (time < drawn.time) {
      drawn.drift = 0;
      drawn.density.forget(time);
    }
    drawn.time = time;
    drawn.drift += wind * 100 * elapsed;
    if (target || !this.scene) this.parting.advance(elapsed, displays);
    const weather = { time, density: drawn.density.value, history: drawn.density.history, wind, drift: drawn.drift, touches: this.parting.touches };
    displays.forEach((display, index) => drawn.effect.paint(display, index, weather, elapsed));
  }
}
