import { getLoginManager } from '../../session/actions/loginManager.js';
import type { AuthPrompt } from '../prompt/authPrompt.js';
import { FingerprintAuthentication } from '../prompt/fingerprint.js';
import { rememberedMethod, rememberMethod, type SignInMethod } from './signInMethod.js';

interface LockFingerprintOptions {
  userName: string;
  promptShown: () => boolean;
  unlock: () => void;
}

export class LockFingerprint {
  private readonly fingerprint = new FingerprintAuthentication();
  private readonly loginManager = getLoginManager();
  private readonly userName: string;
  private readonly promptShown: () => boolean;
  private prompt: AuthPrompt | null = null;
  private choice: SignInMethod | null = null;

  constructor({ userName, promptShown, unlock }: LockFingerprintOptions) {
    this.userName = userName;
    this.promptShown = promptShown;
    this.fingerprint.connect('state-changed', () => this.sync());
    this.fingerprint.connect('succeeded', () => {
      rememberMethod('fingerprint');
      unlock();
    });
    this.fingerprint.connect('stopped', (_fingerprint, attempted) => {
      if (!attempted && !this.promptShown()) this.start();
    });
    this.loginManager.connectObject(
      'lid-changed', () => this.restart(),
      'prepare-for-sleep', (_manager: unknown, sleeping: boolean) => (sleeping ? this.fingerprint.cancel() : this.start()),
      this);
  }

  get matched(): boolean {
    return this.fingerprint.state.kind === 'match';
  }

  start(): void {
    if (!this.fingerprint.running && !this.loginManager.lidClosed) this.fingerprint.begin(this.userName);
  }

  attach(prompt: AuthPrompt): void {
    this.prompt = prompt;
    this.choice = rememberedMethod();
    prompt.connectObject(
      'use-password', () => this.choose('password'),
      'use-fingerprint', () => {
        this.choose('fingerprint');
        this.start();
      },
      this);
    this.sync();
  }

  detach(): void {
    this.prompt?.disconnectObject(this);
    this.prompt = null;
    this.start();
  }

  cancel(): void {
    this.fingerprint.cancel();
  }

  destroy(): void {
    this.loginManager.disconnectObject(this);
    this.fingerprint.destroy();
  }

  private restart(): void {
    this.fingerprint.cancel();
    this.start();
    this.sync();
  }

  private choose(method: SignInMethod): void {
    this.choice = method;
    this.sync();
  }

  private sync(): void {
    const primary = this.fingerprint.listening && this.choice !== 'password';
    this.prompt?.setFingerprint(this.fingerprint.state, primary);
  }
}
