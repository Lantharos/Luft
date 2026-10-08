import type { Context } from '../../context.js';
import { KeyringDialog, loadDialogModules, type DialogModules, type Prompt } from './dialog.js';
import { ALLOWED, ALTERNATIVE, DENIED, DISMISSED } from './request.js';

type Session = Pick<Context, 'sessionMode' | 'screenShield'>;

export interface Call {
  key: string;
  prompt: Prompt;
  answer(response: number, remember: boolean): void;
  deliver(secret: string): Promise<void>;
  measure?(secret: string): Promise<number>;
}

interface Active {
  key: string;
  dialog: KeyringDialog | null;
  pending: Call | null;
  closing: boolean;
}

export class PromptQueue {
  private readonly queue: Call[] = [];
  private readonly refused = new Set<string>();
  private readonly disconnectors: (() => void)[] = [];
  private active: Active | null = null;
  private modules: DialogModules | null = null;
  private loading: Promise<DialogModules> | null = null;

  constructor(private readonly session: Session) {
    const sessionId = session.sessionMode.connect('updated', () => this.syncLock());
    this.disconnectors.push(() => session.sessionMode.disconnect(sessionId));
    const shield = session.screenShield;
    if (shield) {
      const shieldId = shield.connect('active-changed', () => this.syncLock());
      this.disconnectors.push(() => shield.disconnect(shieldId));
    }
  }

  async ready(): Promise<void> {
    this.loading ??= loadDialogModules();
    this.modules = await this.loading;
  }

  private get locked(): boolean {
    return this.session.sessionMode.isLocked || !!this.session.screenShield?.active;
  }

  receive(call: Call): void {
    const { active } = this;
    if (call.prompt.kind === 'password' && this.refused.delete(call.key)) {
      call.answer(DENIED, false);
    } else if (active?.key === call.key && !active.closing && call.prompt.kind === 'password' && active.dialog?.kind === 'password') {
      active.pending?.answer(DISMISSED, false);
      active.pending = call;
      active.dialog.retry(call.prompt.request, call.measure);
    } else if (active?.key === call.key && !active.closing) {
      this.queue.unshift(call);
      this.dismiss(active);
    } else {
      this.queue.push(call);
      this.next();
    }
  }

  close(key: string): void {
    this.refused.delete(key);
    if (this.active?.key === key) this.dismiss(this.active);
    for (const call of this.queue.filter(call => call.key === key)) {
      this.queue.splice(this.queue.indexOf(call), 1);
      call.answer(DISMISSED, false);
    }
  }

  private next(): void {
    if (this.active || this.locked) return;
    const call = this.queue.shift();
    if (call) this.show(call);
  }

  private show(call: Call): void {
    const active: Active = { key: call.key, dialog: null, pending: call, closing: false };
    this.active = active;
    active.dialog = KeyringDialog.open(this.modules!, call.prompt, {
      allowed: remember => this.respond(active, ALLOWED, remember),
      alternative: () => this.respond(active, ALTERNATIVE),
      denied: () => {
        if (!active.pending) this.refused.add(active.key);
        this.respond(active, DENIED, active.dialog?.remembered);
      },
      entered: secret => this.enter(active, secret),
      closed: () => this.finished(active),
    }, call.measure);
    if (!active.dialog) this.finished(active);
  }

  private respond(active: Active, response: number, remember = false): void {
    active.pending?.answer(response, remember);
    active.pending = null;
    active.closing = true;
    active.dialog?.close();
  }

  private dismiss(active: Active): void {
    this.respond(active, DISMISSED, active.dialog?.remembered);
  }

  private async enter(active: Active, secret: string): Promise<void> {
    const call = active.pending!;
    active.pending = null;
    try {
      await call.deliver(secret);
      call.answer(ALLOWED, active.dialog?.remembered ?? false);
    } catch (error) {
      console.warn(`Kestrel could not hand over what was typed: ${error}`);
      call.answer(DISMISSED, false);
      this.respond(active, DISMISSED);
    }
  }

  private finished(active: Active): void {
    active.pending?.answer(DISMISSED, false);
    active.pending = null;
    if (this.active !== active) return;
    this.active = null;
    this.next();
  }

  private syncLock(): void {
    if (!this.locked) this.next();
    else if (this.active && !this.active.closing) this.dismiss(this.active);
  }

  destroy(): void {
    for (const disconnect of this.disconnectors) disconnect();
    for (const call of this.queue.splice(0)) call.answer(DISMISSED, false);
    if (this.active) this.dismiss(this.active);
  }
}
