import Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import type Meta from 'gi://Meta';

import { frameUniforms, WindowPixels } from '../../../extensions/api/v1/screenEffects/windows/pixels.js';
import type { Uniforms } from '../../../extensions/api/v1/screenEffects/shaders.js';

const EFFECT = 'extension-window-transition';

export interface ShaderTransition {
  snippet: Cogl.Snippet;
  uniforms: Uniforms;
  duration: number;
  kind: 'open' | 'close';
}

export interface WindowTransitionSource {
  transitionFor(window: Meta.Window, kind: 'open' | 'close'): ShaderTransition | null;
}

/** The shaders extensions added for windows opening and closing, asked only when a window does. */
class WindowTransitions {
  private readonly sources = new Set<WindowTransitionSource>();

  add(source: WindowTransitionSource): () => void {
    this.sources.add(source);
    return () => this.sources.delete(source);
  }

  find(actor: Meta.WindowActor, kind: 'open' | 'close'): ShaderTransition | null {
    if (!this.sources.size) return null;
    for (const source of this.sources) {
      const transition = source.transitionFor(actor.meta_window!, kind);
      if (transition) return transition;
    }
    return null;
  }
}

export const windowTransitions = new WindowTransitions();

/** Runs a window through a transition's shader, with `window_progress` going from 0 to 1, over the window and everything drawn with it. */
export class RunningTransition {
  private readonly effect = new WindowPixels();
  private readonly timeline: Clutter.Timeline;

  constructor(private readonly actor: Meta.WindowActor, transition: ShaderTransition, finished: () => void) {
    frameUniforms(transition.uniforms, actor.meta_window!);
    transition.uniforms.set('window_progress', 1, [0]);
    this.effect.shade(transition.snippet, transition.uniforms);
    actor.add_effect_with_name(EFFECT, this.effect);
    this.timeline = new Clutter.Timeline({ actor, duration: transition.duration });
    this.timeline.connect('new-frame', () => this.effect.uniform('window_progress', 1, [this.timeline.get_progress()]));
    this.timeline.connect('stopped', (_timeline, finishedPlaying: boolean) => {
      if (finishedPlaying) finished();
    });
  }

  start(): void {
    this.timeline.start();
  }

  stop(): void {
    this.timeline.stop();
    this.actor.remove_effect_by_name(EFFECT);
  }
}
