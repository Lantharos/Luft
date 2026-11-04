import type { Disposable, Extension } from '@luft/extension-api';

import { type Granted, PultClient, SignedOut } from './client.js';
import type { DeviceCode, ItemHit, WaitingIn } from './types.js';

const REFRESH_MS = 60_000;
const SEEN = 'seen-urgent';
const SEEN_KEPT = 200;
const DEVICE_NAME = 'Luft';

export type SignIn = { code: DeviceCode } | { failed: true } | null;

/** What's waiting in Pult for the person signed in, kept fresh while they're signed in, and signing in itself. */
export class Pult {
  readonly client: PultClient;
  places: WaitingIn[] | null = null;
  reachable = true;
  signIn: SignIn = null;
  private refreshing: Disposable | null = null;
  private redeeming: Disposable | null = null;
  private readonly listeners = new Set<() => void>();

  constructor(readonly extension: Extension<Granted>) {
    this.client = new PultClient(extension);
  }

  async start(): Promise<void> {
    if (await this.client.load()) this.follow();
    this.changed();
  }

  onChanged(listener: () => void): void {
    this.listeners.add(listener);
  }

  /** How many items the taskbar counts, by what people chose to count. */
  get count(): number {
    const field = this.extension.settings.get<'open' | 'unread'>('count');
    return (this.places ?? []).reduce((sum, place) => sum + place.inboxes.reduce((inboxes, inbox) => inboxes + inbox[field], 0), 0);
  }

  get urgent(): ItemHit[] {
    return (this.places ?? []).flatMap(place => place.urgent);
  }

  async refresh(): Promise<void> {
    try {
      this.places = await this.client.waiting();
      this.reachable = true;
      this.announceUrgent();
    } catch (error) {
      if (error instanceof SignedOut) this.stopFollowing();
      else this.reachable = false;
    }
    this.changed();
  }

  async beginSignIn(): Promise<void> {
    this.cancelSignIn();
    const code = await this.client.requestCode(DEVICE_NAME);
    this.signIn = { code };
    this.extension.open(code.verificationUriComplete);
    const expires = Date.now() + code.expiresIn * 1000;
    this.redeeming = this.extension.timers.interval(code.interval * 1000, () => void this.redeem(code, expires));
    this.changed();
  }

  reopenSignIn(): void {
    if (this.signIn && 'code' in this.signIn) this.extension.open(this.signIn.code.verificationUriComplete);
  }

  cancelSignIn(): void {
    this.redeeming?.dispose();
    this.redeeming = null;
    this.signIn = null;
    this.changed();
  }

  async signOut(): Promise<void> {
    await this.client.signOut();
    this.stopFollowing();
    this.changed();
  }

  private async redeem(code: DeviceCode, expires: number): Promise<void> {
    try {
      if (!await this.client.redeem(code)) {
        if (Date.now() > expires) throw new Error('The code expired');
        return;
      }
      this.cancelSignIn();
      this.follow();
    } catch {
      this.redeeming?.dispose();
      this.redeeming = null;
      this.signIn = { failed: true };
      this.changed();
    }
  }

  private follow(): void {
    this.refreshing?.dispose();
    this.refreshing = this.extension.timers.interval(REFRESH_MS, () => void this.refresh());
    void this.refresh();
  }

  private stopFollowing(): void {
    this.refreshing?.dispose();
    this.refreshing = null;
    this.places = null;
  }

  /** Tells people about each urgent item once, while they want to hear about them. */
  private announceUrgent(): void {
    const seen = this.extension.storage.get<string[]>(SEEN) ?? [];
    const fresh = this.urgent.filter(item => !seen.includes(item.url));
    if (!fresh.length) return;
    this.extension.storage.set(SEEN, [...seen, ...fresh.map(item => item.url)].slice(-SEEN_KEPT));
    if (!this.extension.settings.get<boolean>('urgent')) return;
    const { t, notifications } = this.extension;
    for (const item of fresh) {
      notifications.send({
        title: t('urgent-title', { inbox: item.inboxLabel }),
        body: item.title,
        icon: 'icons/pult-symbolic.svg',
        urgent: true,
        onActivate: () => this.extension.open(item.url),
      });
    }
  }

  private changed(): void {
    for (const listener of this.listeners) listener();
  }
}
