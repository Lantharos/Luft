import type GObject from 'gi://GObject';

import * as KestrelUi from '../../kestrelUi.js';
import * as Signals from '../../core/runtime/signals.js';
import { getLoginManager } from '../../session/actions/loginManager.js';
import type { SignInMethod } from '../lockScreen/signInMethod.js';
import type { Authentication, AuthenticationSignals } from '../prompt/authentication.js';
import type { AuthPrompt } from '../prompt/authPrompt.js';
import { type FingerprintState, watchVerifyResults } from '../prompt/fingerprintState.js';
import { stateFile } from './config.js';

const METHOD_QUESTION = 'Sign in with (fingerprint/password): ';
const FINGERPRINT_QUESTION = 'Touch the fingerprint reader, or type password: ';

function rememberedMethod(uid: number): SignInMethod | null {
  try {
    const method = new TextDecoder().decode(stateFile('users', String(uid), 'sign-in-method').load_contents(null)[1]);
    return method === 'fingerprint' || method === 'password' ? method : null;
  } catch {
    return null;
  }
}

export class GreeterSignIn extends Signals.EventEmitter {
  declare emit: GObject.SignalMethods<this, AuthenticationSignals>['emit'];

  private readonly loginManager = getLoginManager();
  private userName: string | null = null;
  private stopWatching: (() => void) | null = null;
  private fingerprint: FingerprintState = { kind: 'idle' };
  private choice: SignInMethod | null = null;
  private prompt: AuthPrompt | null = null;
  method: SignInMethod = 'password';

  constructor(private readonly authentication: Authentication) {
    super();
    authentication.connectObject(
      'question', (_: Authentication, text: string, secret: boolean) => this.onQuestion(text, secret),
      'message', (_: Authentication, text: string, isError: boolean) => this.emit('message', text, isError),
      'failed', (_: Authentication, authError: boolean, description: string) => this.onFailed(authError, description),
      'succeeded', () => this.emit('succeeded'),
      this);
  }

  attach(prompt: AuthPrompt): void {
    this.prompt = prompt;
    prompt.connect('use-password', () => this.choose('password'));
    prompt.connect('use-fingerprint', () => this.choose('fingerprint'));
  }

  prepare(uid: number | null): void {
    this.choice = uid === null ? null : rememberedMethod(uid);
    this.method = this.loginManager.lidClosed ? 'password' : 'fingerprint';
    this.setFingerprint({ kind: 'idle' });
  }

  begin(userName: string): void {
    this.userName = userName;
    this.unwatch();
    if (this.method === 'fingerprint') this.stopWatching = watchVerifyResults(state => this.onResult(state));
    this.authentication.begin(userName);
  }

  answer(response: string): void {
    this.authentication.answer(response);
  }

  cancel(): void {
    this.unwatch();
    this.authentication.cancel();
    this.setFingerprint({ kind: 'idle' });
  }

  private choose(method: SignInMethod): void {
    this.choice = method;
    if (method === 'password') {
      this.unwatch();
      this.method = 'password';
      this.sync();
    } else if (this.userName && !this.loginManager.lidClosed) {
      this.method = 'fingerprint';
      this.setFingerprint({ kind: 'idle' });
      this.begin(this.userName);
    }
  }

  private unwatch(): void {
    this.stopWatching?.();
    this.stopWatching = null;
  }

  private onQuestion(text: string, secret: boolean): void {
    if (!secret && text === METHOD_QUESTION) {
      this.authentication.answer(this.method);
    } else if (!secret && text === FINGERPRINT_QUESTION) {
      if (this.method === 'fingerprint' && this.fingerprint.kind === 'idle') this.setFingerprint({ kind: 'scanning' });
      this.authentication.answer(this.method);
    } else {
      if (this.method === 'fingerprint') this.endFingerprint();
      this.emit('question', text, secret);
    }
  }

  private endFingerprint(): void {
    this.unwatch();
    this.method = 'password';
    this.setFingerprint(this.fingerprint.kind === 'idle' ? { kind: 'idle' } : { kind: 'unavailable' });
  }

  private onResult(state: FingerprintState): void {
    if (this.fingerprint.kind === 'idle') return;
    if (state.kind === 'no-match') KestrelUi.playSound('error');
    this.setFingerprint(state);
  }

  private onFailed(authError: boolean, description: string): void {
    if (this.method !== 'fingerprint') {
      this.emit('failed', authError, description);
      return;
    }
    this.endFingerprint();
    this.begin(this.userName!);
  }

  private setFingerprint(state: FingerprintState): void {
    this.fingerprint = state;
    this.sync();
  }

  private sync(): void {
    const listening = this.method === 'fingerprint' && this.fingerprint.kind !== 'idle';
    this.prompt?.setFingerprint(this.fingerprint, listening && this.choice !== 'password');
  }
}
