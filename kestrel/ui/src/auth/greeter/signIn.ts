import type GObject from 'gi://GObject';

import * as KestrelUi from '../../kestrelUi.js';
import * as Signals from '../../core/runtime/signals.js';
import { getLoginManager } from '../../session/actions/loginManager.js';
import { isSignInMethod, methodIn, type SignInMethod } from '../lockScreen/signInMethod.js';
import type { Authentication, AuthenticationSignals } from '../prompt/authentication.js';
import type { AuthPrompt } from '../prompt/authPrompt.js';
import { type FingerprintState, watchVerifyResults } from '../prompt/fingerprintState.js';
import type { Way } from '../prompt/methodArea.js';
import { allowsPassword, fetchWays, pickMethod, usableWays } from '../prompt/ways.js';
import { stateFile } from './config.js';

const METHOD_QUESTION = 'Sign in with (fingerprint/security-key/smart-card/recovery-key/password): ';
const FINGERPRINT_QUESTION = 'Touch the fingerprint reader, or type password: ';
const PASSWORD_BACK = 'Password sign-in is back on';

export class GreeterSignIn extends Signals.EventEmitter {
  declare emit: GObject.SignalMethods<this, AuthenticationSignals>['emit'];

  private readonly loginManager = getLoginManager();
  private readonly known = new Map<number, Promise<SignInMethod[]>>();
  private userName: string | null = null;
  private stopWatching: (() => void) | null = null;
  private fingerprint: FingerprintState = { kind: 'idle' };
  private ways: SignInMethod[] = ['password'];
  private uid: number | null = null;
  private prompt: AuthPrompt | null = null;
  private way: Way = 'password';
  method: SignInMethod = 'password';

  constructor(private readonly authentication: Authentication) {
    super();
    authentication.connectObject(
      'question', (_: Authentication, text: string, secret: boolean) => this.onQuestion(text, secret),
      'message', (_: Authentication, text: string, isError: boolean) => this.onMessage(text, isError),
      'failed', (_: Authentication, authError: boolean, description: string) => this.onFailed(authError, description),
      'succeeded', () => this.emit('succeeded'),
      this);
  }

  attach(prompt: AuthPrompt): void {
    this.prompt = prompt;
    prompt.connect('use-way', (_prompt, way: string) => this.choose(way as Way));
  }

  /** Learns ahead how each of `uids` signs in, so choosing one opens on the right way at once. */
  learn(uids: number[]): void {
    for (const uid of uids) if (!this.known.has(uid)) this.known.set(uid, fetchWays(uid));
  }

  /**
   * Opens on the way `uid` signs in, from what was learned ahead, then asks again in case they
   * enrolled something since, and moves to it if so.
   */
  async prepare(uid: number | null): Promise<void> {
    this.unwatch();
    this.uid = uid;
    this.userName = null;
    if (uid === null) {
      this.ways = ['password'];
    } else {
      this.learn([uid]);
      this.ways = await this.known.get(uid)!;
      const fresh = fetchWays(uid);
      this.known.set(uid, fresh);
      void fresh.then(ways => {
        if (this.uid !== uid || ways.join() === this.ways.join()) return;
        this.ways = ways;
        this.choose(this.pick(uid));
      });
    }
    this.use(this.pick(uid), true);
  }

  private pick(uid: number | null): SignInMethod {
    const remembered = uid === null ? null : methodIn(stateFile('users', String(uid), 'sign-in-method'));
    return pickMethod(this.ways, remembered, this.loginManager.lidClosed);
  }

  begin(userName: string): void {
    this.userName = userName;
    this.unwatch();
    if (this.way === 'fingerprint') this.stopWatching = watchVerifyResults(state => this.onResult(state));
    this.authentication.begin(userName);
  }

  answer(response: string): void {
    this.authentication.answer(response);
  }

  cancel(): void {
    this.unwatch();
    this.authentication.cancel();
    this.fingerprint = { kind: 'idle' };
  }

  private offered(): Way[] {
    const usable = usableWays<Way>(this.ways, this.loginManager.lidClosed);
    return allowsPassword(this.ways) ? usable : [...usable, 'recovery-key'];
  }

  private use(way: Way, instant = false): void {
    this.way = way;
    if (isSignInMethod(way)) this.method = way;
    this.prompt?.setWays(this.offered(), way);
    this.fingerprint = way === 'fingerprint' ? { kind: 'preparing' } : { kind: 'idle' };
    this.sync(instant);
  }

  private choose(way: Way): void {
    if (way === 'fingerprint' && this.loginManager.lidClosed) return;
    if (way === 'password' && this.way === 'fingerprint' && this.stopWatching) {
      this.unwatch();
      this.use('password');
      return;
    }
    this.unwatch();
    this.authentication.cancel();
    this.use(way);
    if (this.userName) this.prompt?.begin(this.userName);
  }

  private unwatch(): void {
    this.stopWatching?.();
    this.stopWatching = null;
  }

  private onQuestion(text: string, secret: boolean): void {
    if (!secret && text === METHOD_QUESTION) {
      this.authentication.answer(this.way);
    } else if (!secret && text === FINGERPRINT_QUESTION) {
      if (this.way === 'fingerprint' && this.fingerprint.kind === 'preparing') this.setFingerprint({ kind: 'scanning' });
      this.authentication.answer(this.way === 'fingerprint' ? 'fingerprint' : 'password');
    } else {
      if (this.way === 'fingerprint') this.endFingerprint();
      this.emit('question', text, secret);
    }
  }

  private onMessage(text: string, isError: boolean): void {
    if (text === PASSWORD_BACK) {
      this.ways = [...this.ways.filter(way => way !== 'password'), 'password'];
      this.way = 'password';
      this.method = 'password';
      this.prompt?.setWays(this.offered(), 'password');
    }
    this.emit('message', text, isError);
  }

  /** The reader gave up: the password takes over, or, with it turned off, the reader waits to be tried again. */
  private endFingerprint(): void {
    this.unwatch();
    const tried = this.fingerprint.kind !== 'idle';
    if (allowsPassword(this.ways)) {
      this.way = 'password';
      this.method = 'password';
      this.prompt?.setWays(this.offered(), 'password');
    }
    this.setFingerprint(tried ? { kind: 'unavailable' } : { kind: 'idle' });
  }

  private onResult(state: FingerprintState): void {
    if (this.fingerprint.kind === 'idle' || this.fingerprint.kind === 'preparing') return;
    if (state.kind === 'no-match') KestrelUi.playSound('error');
    this.setFingerprint(state);
  }

  private onFailed(authError: boolean, description: string): void {
    if (this.way !== 'fingerprint') {
      this.emit('failed', authError, description);
      return;
    }
    this.endFingerprint();
    if (allowsPassword(this.ways)) this.begin(this.userName!);
  }

  private setFingerprint(state: FingerprintState): void {
    this.fingerprint = state;
    this.sync(false);
  }

  private sync(instant: boolean): void {
    const primary = this.way === 'fingerprint' && this.fingerprint.kind !== 'idle';
    this.prompt?.setFingerprint(this.fingerprint, primary, instant);
  }
}
