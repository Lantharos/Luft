import type GObject from 'gi://GObject';

import * as Signals from '../runtime/signals.js';
import type { GreetdChannel, GreetdReply, SessionOptions } from './greetd.js';

export interface AuthenticationSignals {
  succeeded: () => void;
  failed: (authError: boolean, description: string) => void;
  question: (text: string, secret: boolean) => void;
  message: (text: string, isError: boolean) => void;
}

type Step = (channel: GreetdChannel) => Promise<GreetdReply | null>;

export class Authentication extends Signals.EventEmitter {
  declare connect: GObject.SignalMethods<this, AuthenticationSignals>['connect'];
  declare emit: GObject.SignalMethods<this, AuthenticationSignals>['emit'];

  private channel: GreetdChannel | null = null;
  private queue = Promise.resolve();
  private generation = 0;
  private configuring = false;
  private busy = false;

  constructor(private readonly openChannel: () => Promise<GreetdChannel>, private readonly sessionOptions: SessionOptions = {}) {
    super();
  }

  begin(userName: string): void {
    this.run(++this.generation, async channel => {
      await this.closeSession(channel);
      this.configuring = true;
      return channel.request({ type: 'create_session', username: userName, ...this.sessionOptions });
    });
  }

  answer(response: string): void {
    this.run(this.generation, channel => channel.request({ type: 'post_auth_message_response', response }));
  }

  cancel(): void {
    const generation = ++this.generation;
    if (this.busy && this.channel?.abortable) {
      this.dropChannel(this.channel);
      return;
    }
    this.run(generation, async channel => {
      await this.closeSession(channel);
      return null;
    });
  }

  startSession(command: string[], environment: string[]): Promise<boolean> {
    return new Promise(resolve => this.run(this.generation, async channel => {
      const reply = await channel.request({ type: 'start_session', cmd: command, env: environment });
      resolve(reply.type === 'success');
      return null;
    }));
  }

  destroy(): void {
    this.generation++;
    if (this.channel) this.dropChannel(this.channel);
  }

  private async closeSession(channel: GreetdChannel): Promise<void> {
    if (!this.configuring) return;
    this.configuring = false;
    await channel.request({ type: 'cancel_session' });
  }

  private dropChannel(channel: GreetdChannel): void {
    channel.close();
    if (this.channel !== channel) return;
    this.channel = null;
    this.configuring = false;
  }

  private run(generation: number, step: Step): void {
    this.queue = this.queue.then(async () => {
      if (generation !== this.generation) return;
      this.busy = true;
      let reply: GreetdReply | null;
      let channel = this.channel;
      try {
        channel ??= this.channel = await this.openChannel();
        reply = await step(channel);
      } catch (error) {
        if (channel) this.dropChannel(channel);
        reply = { type: 'error', error_type: 'error', description: (error as Error).message };
      } finally {
        this.busy = false;
      }
      if (reply && generation === this.generation) this.handle(reply, generation);
    });
  }

  private handle(reply: GreetdReply, generation: number): void {
    if (reply.type === 'success') {
      this.emit('succeeded');
      return;
    }

    if (reply.type === 'error') {
      this.emit('failed', reply.error_type === 'auth_error', reply.description);
      return;
    }

    const { auth_message_type: kind, auth_message: text } = reply;
    if (kind === 'secret' || kind === 'visible') {
      this.emit('question', text, kind === 'secret');
      return;
    }

    this.emit('message', text, kind === 'error');
    this.run(generation, channel => channel.request({ type: 'post_auth_message_response' }));
  }
}
