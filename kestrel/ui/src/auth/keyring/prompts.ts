import { PinentryPrompter } from './pinentry.js';
import { KeyringPrompter } from './prompter.js';
import { PromptQueue } from './queue.js';

export class SystemPrompts {
  private readonly queue: PromptQueue;
  private readonly keyring: KeyringPrompter;
  private readonly pinentry: PinentryPrompter;

  constructor() {
    this.queue = new PromptQueue();
    this.keyring = new KeyringPrompter(this.queue);
    this.pinentry = new PinentryPrompter(this.queue);
  }

  destroy(): void {
    this.keyring.destroy();
    this.pinentry.destroy();
    this.queue.destroy();
  }
}
