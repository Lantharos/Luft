import type GObject from 'gi://GObject';

import * as KestrelUi from '../../kestrelUi.js';
import * as Signals from '../../core/runtime/signals.js';
import { Authentication } from './authentication.js';
import { type FingerprintState, watchVerifyResults } from './fingerprintState.js';
import { connectAuthenticator } from './greetd.js';

interface FingerprintSignals {
  'state-changed': (state: FingerprintState) => void;
  'succeeded': () => void;
  'stopped': (attempted: boolean) => void;
}

export class FingerprintAuthentication extends Signals.EventEmitter {
  declare connect: GObject.SignalMethods<this, FingerprintSignals>['connect'];
  declare emit: GObject.SignalMethods<this, FingerprintSignals>['emit'];

  private readonly authentication = new Authentication(connectAuthenticator, { mode: 'fingerprint' });
  private stopWatching: (() => void) | null = null;
  private attempted = false;
  state: FingerprintState = { kind: 'idle' };

  constructor() {
    super();
    this.authentication.connectObject(
      'question', () => this.stop(),
      'message', (_: Authentication, _text: string, isError: boolean) => this.onMessage(isError),
      'failed', () => this.stop(),
      'succeeded', () => this.succeed(),
      this);
  }

  get listening(): boolean {
    return this.stopWatching !== null && this.state.kind !== 'idle';
  }

  get running(): boolean {
    return this.stopWatching !== null;
  }

  begin(userName: string): void {
    this.cancel();
    this.state = { kind: 'idle' };
    this.attempted = false;
    this.stopWatching = watchVerifyResults(state => this.onResult(state));
    this.authentication.begin(userName);
  }

  cancel(): void {
    if (!this.running) return;
    this.unwatch();
    this.authentication.cancel();
    this.setState({ kind: 'idle' });
  }

  destroy(): void {
    this.unwatch();
    this.authentication.destroy();
  }

  private unwatch(): void {
    this.stopWatching?.();
    this.stopWatching = null;
  }

  private onMessage(isError: boolean): void {
    if (isError || this.state.kind !== 'idle') return;
    this.setState({ kind: 'scanning' });
  }

  private onResult(state: FingerprintState): void {
    if (this.state.kind === 'idle') return;
    this.attempted = true;
    if (state.kind === 'no-match') KestrelUi.playSound('error');
    this.setState(state);
  }

  private succeed(): void {
    this.unwatch();
    this.setState({ kind: 'match' });
    this.emit('succeeded');
  }

  private stop(): void {
    if (!this.running) return;
    const listened = this.state.kind !== 'idle';
    this.unwatch();
    this.authentication.cancel();
    this.setState(listened ? { kind: 'unavailable' } : { kind: 'idle' });
    if (listened) this.emit('stopped', this.attempted);
  }

  private setState(state: FingerprintState): void {
    this.state = state;
    this.emit('state-changed', state);
  }
}
