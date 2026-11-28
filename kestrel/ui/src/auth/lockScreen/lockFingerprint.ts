import { getLoginManager } from '../../session/actions/loginManager.js';
import type { AuthPrompt } from '../prompt/authPrompt.js';
import { FingerprintAuthentication } from '../prompt/fingerprint.js';

interface LockFingerprintOptions {
  userName: string;
  promptShown: () => boolean;
  chosen: () => boolean;
  passwordAllowed: () => boolean;
  unlock: () => void;
}

export class LockFingerprint {
  private readonly fingerprint = new FingerprintAuthentication();
  private readonly loginManager = getLoginManager();
  private readonly userName: string;
  private readonly promptShown: () => boolean;
  private readonly chosen: () => boolean;
  private readonly passwordAllowed: () => boolean;
  private prompt: AuthPrompt | null = null;
  enrolled = false;

  constructor({ userName, promptShown, chosen, passwordAllowed, unlock }: LockFingerprintOptions) {
    this.userName = userName;
    this.promptShown = promptShown;
    this.chosen = chosen;
    this.passwordAllowed = passwordAllowed;
    this.fingerprint.connect('state-changed', () => this.sync());
    this.fingerprint.connect('succeeded', () => unlock());
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
    if (this.enrolled && !this.fingerprint.running && !this.loginManager.lidClosed) this.fingerprint.begin(this.userName);
  }

  attach(prompt: AuthPrompt): void {
    this.prompt = prompt;
    this.sync(true);
  }

  detach(): void {
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

  /**
   * Shows the reader's state, leading with it while fingerprint is the chosen way. Until fprintd
   * listens, it says the sensor is getting ready, never showing the password first. A reader that
   * gave up hands over to the password when the password may sign in.
   */
  sync(instant = false): void {
    const chosen = this.chosen() && this.enrolled && !this.loginManager.lidClosed;
    const { state } = this.fingerprint;
    const shown = chosen && state.kind === 'idle' ? { kind: 'preparing' as const } : state;
    const handedOver = shown.kind === 'unavailable' && this.passwordAllowed();
    this.prompt?.setFingerprint(shown, chosen && shown.kind !== 'idle' && !handedOver, instant);
  }
}
