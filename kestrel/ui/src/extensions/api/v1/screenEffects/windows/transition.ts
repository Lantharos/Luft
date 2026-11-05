import type Cogl from 'gi://Cogl';
import type Meta from 'gi://Meta';

import { type ShaderTransition, windowTransitions, type WindowTransitionSource } from '../../../../../desktop/windowManager/effects/shaderTransition.js';
import type { ApiContext } from '../../context.js';
import type { WindowTransitionOptions } from '../../types.js';
import { Effect } from '../effect.js';
import { compileError, Uniforms, windowSnippet } from '../shaders.js';
import type { EffectsStage } from '../stage.js';
import { windowDetails } from './tracker.js';

/** A shader a window opens or closes through. It only attaches for the moment the window takes to do so. */
export class WindowTransition extends Effect implements WindowTransitionSource {
  readonly cost = 0;
  private readonly snippet: Cogl.Snippet;
  private readonly uniforms = new Uniforms();
  private unregister: (() => void) | null = null;

  constructor(stage: EffectsStage, context: ApiContext, private readonly transitionOptions: WindowTransitionOptions) {
    const snippet = windowSnippet(transitionOptions.declarations ?? '', transitionOptions.shader);
    super(stage, context, transitionOptions);
    this.snippet = snippet;
    this.begin(compileError(snippet));
    if (!this.problem) this.unregister = windowTransitions.add(this);
  }

  get attached(): boolean {
    return false;
  }

  sync(): void {}

  protected tick(): void {}

  set(name: string, ...values: number[]): void {
    this.uniforms.set(name, values.length, values);
  }

  transitionFor(window: Meta.Window, kind: 'open' | 'close'): ShaderTransition | null {
    const { kinds, match, duration, fullscreen } = this.transitionOptions;
    if (!this.allowed || !kinds.includes(kind)) return null;
    const details = windowDetails(window);
    if (details.fullscreen && !fullscreen) return null;
    if (!this.context.scope.run(() => match(details))) return null;
    return { snippet: this.snippet, uniforms: this.uniforms, duration, kind };
  }

  protected detach(): void {
    this.unregister?.();
  }
}
