import type { ApiContext } from '../../core/context.js';
import type { Disposable, ScreenEffectBase, ScreenEffectOptions, ScreenEffectProblem } from '../../types.js';
import { effectTime } from './clock.js';
import type { EffectsStage, StagedEffect } from './stage.js';

const DEFAULT_FRAME_RATE = 30;

export abstract class Effect implements StagedEffect, ScreenEffectBase {
  private problemWas: ScreenEffectProblem | null = null;
  private unstage: (() => void) | null = null;
  private stopClock: (() => void) | null = null;
  private gone = false;
  private readonly owned: Disposable;
  abstract readonly cost: number;
  abstract readonly attached: boolean;

  protected constructor(protected readonly stage: EffectsStage, protected readonly context: ApiContext, protected readonly options: ScreenEffectOptions) {
    this.owned = context.scope.disposable(() => this.release());
  }

  protected begin(compileError: string | null): void {
    if (compileError !== null) this.fail('shader', compileError);
    else this.unstage = this.stage.add(this);
  }

  get problem(): ScreenEffectProblem | null {
    return this.problemWas;
  }

  protected get allowed(): boolean {
    return !this.gone && !this.problemWas && !this.stage.held;
  }

  protected abstract detach(): void;

  abstract sync(): void;

  abstract set(name: string, ...values: number[]): void;

  protected abstract tick(time: number): void;

  protected keepTime(moving: boolean): void {
    const rate = typeof this.options.animated === 'number' ? this.options.animated : DEFAULT_FRAME_RATE;
    if (moving && this.options.animated && !this.stopClock) {
      this.stopClock = this.stage.clock.add(rate, time => this.tick(time));
      this.tick(effectTime());
    } else if ((!moving || !this.options.animated) && this.stopClock) {
      this.stopClock();
      this.stopClock = null;
    }
  }

  fail(problem: ScreenEffectProblem, detail: string): void {
    if (this.problemWas || this.gone) return;
    this.problemWas = problem;
    console.warn(`Screen effect ${this.options.label} of ${this.context.manifest.id} was turned off (${problem}): ${detail}`);
    this.keepTime(false);
    this.detach();
    this.stage.attachedChanged();
    this.stage.notice(this.context.name, this.options.label, problem, () => this.context.openSettings());
    if (this.options.onProblem) this.context.scope.run(() => this.options.onProblem!(problem, detail));
  }

  private release(): void {
    this.gone = true;
    this.keepTime(false);
    this.detach();
    this.unstage?.();
    this.stage.sync();
  }

  dispose(): void {
    this.owned.dispose();
  }
}
