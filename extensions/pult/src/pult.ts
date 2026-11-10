import type { Disposable, Extension } from '@luft/extension-api';

import { type Granted, PultClient, Refused, SignedOut } from './client.js';
import type { DeviceCode, ItemHit, WaitingIn } from './types.js';

const REFRESH_MS = 60_000;
const ON_BATTERY_MS = 3 * REFRESH_MS;
const SLOWEST_MS = 15 * REFRESH_MS;
const GONE = 410;
const SEEN = 'seen-urgent';
const SEEN_KEPT = 200;
const DEVICE_NAME = 'Luft';

export type SignIn = { code: DeviceCode } | { failed: 'unreachable' | 'unfinished' } | null;

/** What's waiting in Pult for the person signed in, kept fresh while they're signed in, and signing in itself. */
export class Pult {
  readonly client: PultClient;
  places: WaitingIn[] | null = null;
  reachable = true;
  signIn: SignIn = null;
  private following = false;
  private next: Disposable | null = null;
  private failures = 0;
  private requesting = false;
  private redeeming: Disposable | null = null;
  private readonly listeners = new Set<() => void>();

  constructor(readonly extension: Extension<Granted>) {
    this.client = new PultClient(extension);
  }

  async start(): Promise<void> {
    const { session, power, timers } = this.extension;
    session.onChanged(() => this.follow());
    power.onChanged(() => this.follow());
    timers.onClockChanged(cause => {
      if (cause === 'wake' && this.following) void this.refresh();
    });
    await this.client.load();
    this.follow();
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

  /** Asks Pult now, and again later while following: every minute, less often on battery and after each failure in a row. */
  async refresh(): Promise<void> {
    try {
      this.places = await this.client.waiting();
      this.reachable = true;
      this.failures = 0;
      this.announceUrgent();
    } catch (error) {
      if (error instanceof SignedOut) this.follow();
      else {
        this.reachable = false;
        this.failures++;
      }
    }
    this.schedule();
    this.changed();
  }

  private schedule(): void {
    this.next?.dispose();
    this.next = null;
    if (!this.following) return;
    const { power, timers } = this.extension;
    const pace = power.onBattery ? ON_BATTERY_MS : REFRESH_MS;
    this.next = timers.timeout(Math.min(pace * 2 ** this.failures, SLOWEST_MS), () => this.refresh());
  }

  async beginSignIn(): Promise<void> {
    if (this.requesting) return;
    this.cancelSignIn();
    this.requesting = true;
    try {
      const code = await this.client.requestCode(DEVICE_NAME);
      this.signIn = { code };
      this.extension.open(code.verificationUriComplete);
      const expires = Date.now() + code.expiresIn * 1000;
      this.redeeming = this.extension.timers.interval(code.interval * 1000, () => this.redeem(code, expires));
    } catch {
      this.signIn = { failed: 'unreachable' };
    } finally {
      this.requesting = false;
    }
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
    try {
      await this.client.signOut();
    } finally {
      this.follow();
      this.changed();
    }
  }

  /** Keeps asking while Pult can't be reached or the code waits, until Pult turns the code down or its time is up. */
  private async redeem(code: DeviceCode, expires: number): Promise<void> {
    let over = false;
    try {
      if (await this.client.redeem(code)) {
        this.cancelSignIn();
        this.follow();
        return;
      }
    } catch (error) {
      over = error instanceof Refused && error.status === GONE;
    }
    if (!this.signIn || !('code' in this.signIn) || this.signIn.code !== code) return;
    if (!over && Date.now() <= expires) return;
    this.redeeming?.dispose();
    this.redeeming = null;
    this.signIn = { failed: 'unfinished' };
    this.changed();
  }

  /** Follows Pult while signed in, someone is at the desktop and the computer isn't saving power, starting with a look right away. */
  private follow(): void {
    const { session, power } = this.extension;
    if (!this.client.signedIn) this.places = null;
    const wanted = this.client.signedIn && session.active && !power.saving;
    if (wanted === this.following) return;
    this.following = wanted;
    if (wanted) void this.refresh();
    else this.schedule();
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
