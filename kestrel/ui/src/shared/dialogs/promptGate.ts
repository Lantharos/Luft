import GLib from 'gi://GLib';

import * as Main from '../../core/main.js';

const INVITATION_TIME = 5 * GLib.USEC_PER_SEC;

export type WhileLocked = 'wait' | 'refuse';

export interface Prompt {
  readonly whileLocked: WhileLocked;
  open(): boolean;
  close(): void;
  holdBack(): void;
}

interface Invitation {
  readonly prompt: Prompt;
  readonly until: number;
}

class PromptGate {
  private readonly showing = new Set<Prompt>();
  private readonly waiting = new Set<Prompt>();
  private readonly listeners = new Set<(locked: boolean) => void>();
  private invitation: Invitation | null = null;
  private wasLocked: boolean | null = null;

  get locked(): boolean {
    return Main.sessionMode.isLocked || !!Main.screenShield?.active;
  }

  watch(listener: (locked: boolean) => void): () => void {
    this.follow();
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  invite(prompt: Prompt): void {
    this.invitation = { prompt, until: GLib.get_monotonic_time() + INVITATION_TIME };
  }

  takeInvitation(prompt: Prompt): boolean {
    const invitation = this.invitation;
    if (invitation?.prompt !== prompt) return false;
    this.invitation = null;
    return GLib.get_monotonic_time() <= invitation.until;
  }

  admits(prompt: Prompt, invited: boolean): boolean {
    this.follow();
    if (this.locked && !invited) {
      if (prompt.whileLocked === 'wait') this.waiting.add(prompt);
      return false;
    }
    this.showing.add(prompt);
    return true;
  }

  forget(prompt: Prompt): boolean {
    this.showing.delete(prompt);
    return this.waiting.delete(prompt);
  }

  private follow(): void {
    if (this.wasLocked !== null) return;
    this.wasLocked = this.locked;
    Main.sessionMode.connect('updated', () => this.sync());
    Main.screenShield?.connect('active-changed', () => this.sync());
  }

  private sync(): void {
    const locked = this.locked;
    if (locked === this.wasLocked) return;
    this.wasLocked = locked;
    this.invitation = null;
    if (locked) this.clearTheScreen();
    else this.showWaiting();
    for (const listener of this.listeners) listener(locked);
  }

  private clearTheScreen(): void {
    for (const prompt of [...this.showing]) {
      this.showing.delete(prompt);
      if (prompt.whileLocked === 'refuse') {
        prompt.close();
      } else {
        this.waiting.add(prompt);
        prompt.holdBack();
      }
    }
  }

  private showWaiting(): void {
    for (const prompt of [...this.waiting]) {
      this.waiting.delete(prompt);
      prompt.open();
    }
  }
}

export const promptGate = new PromptGate();
