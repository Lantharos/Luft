import type GObject from 'gi://GObject';
import type Polkit from 'gi://Polkit';
import PolkitAgent from 'gi://PolkitAgent';

import * as KestrelUi from '../../kestrelUi.js';
import * as Signals from '../../core/runtime/signals.js';
import { type FingerprintState, watchVerifyResults } from '../prompt/fingerprintState.js';

type Role = 'starting' | 'reader' | 'password';

interface Conversation {
  readonly session: PolkitAgent.Session;
  readonly retry: boolean;
  role: Role;
  answered: boolean;
}

interface ConversationSignals {
  'fingerprint': (state: FingerprintState) => void;
  'question': (text: string, echoOn: boolean) => void;
  'message': (text: string, isError: boolean) => void;
  'failed': () => void;
  'succeeded': () => void;
}

export class Conversations extends Signals.EventEmitter {
  declare connect: GObject.SignalMethods<this, ConversationSignals>['connect'];
  declare emit: GObject.SignalMethods<this, ConversationSignals>['emit'];

  private conversations: Conversation[] = [];
  private identity: Polkit.Identity | null = null;
  private stopWatching: (() => void) | null = null;
  private pending: string | null = null;
  private wantsPassword = false;
  fingerprint: FingerprintState = { kind: 'idle' };

  constructor(private readonly cookie: string) {
    super();
  }

  begin(identity: Polkit.Identity): void {
    this.cancel();
    this.identity = identity;
    this.wantsPassword = false;
    this.setFingerprint({ kind: 'idle' });
    this.start(false);
  }

  usePassword(): void {
    this.wantsPassword = true;
    this.ensure();
  }

  tryFingerprint(): void {
    if (!this.find('reader')) this.start(true);
  }

  answer(response: string): void {
    const conversation = this.find('password');
    if (!conversation) {
      this.pending = response;
      this.usePassword();
      return;
    }
    conversation.answered = true;
    conversation.session.response(response);
  }

  cancel(): void {
    for (const conversation of this.conversations) this.drop(conversation);
    this.conversations = [];
    this.pending = null;
    this.unwatch();
  }

  private find(role: Role): Conversation | undefined {
    return this.conversations.find(conversation => conversation.role === role);
  }

  private start(retry: boolean): void {
    const session = new PolkitAgent.Session({ identity: this.identity!, cookie: this.cookie });
    const conversation: Conversation = { session, retry, role: 'starting', answered: false };
    session.connectObject(
      'request', (_session: PolkitAgent.Session, text: string, echoOn: boolean) => this.onRequest(conversation, text, echoOn),
      'show-info', (_session: PolkitAgent.Session, text: string) => this.onMessage(conversation, text, false),
      'show-error', (_session: PolkitAgent.Session, text: string) => this.onMessage(conversation, text, true),
      'completed', (_session: PolkitAgent.Session, gained: boolean) => this.onCompleted(conversation, gained),
      this);
    this.conversations.push(conversation);
    session.initiate();
  }

  private drop(conversation: Conversation): void {
    conversation.session.disconnectObject(this);
    conversation.session.cancel();
  }

  private ensure(): void {
    if (!this.conversations.length) this.start(false);
    else if (this.wantsPassword && this.conversations.every(conversation => conversation.role === 'reader')) this.start(false);
  }

  private onMessage(conversation: Conversation, text: string, isError: boolean): void {
    if (conversation.role === 'starting') this.read(conversation);
    if (conversation.role !== 'reader') this.emit('message', text, isError);
  }

  private read(conversation: Conversation): void {
    conversation.role = 'reader';
    this.stopWatching ??= watchVerifyResults(state => this.onResult(state));
    this.setFingerprint({ kind: 'scanning' });
    this.ensure();
  }

  private stopReading(): void {
    this.unwatch();
    this.wantsPassword = true;
    this.setFingerprint({ kind: 'unavailable' });
  }

  private onResult(state: FingerprintState): void {
    if (state.kind === 'no-match') KestrelUi.playSound('error');
    this.setFingerprint(state);
  }

  private onRequest(conversation: Conversation, text: string, echoOn: boolean): void {
    if (conversation.role === 'reader' || conversation.retry) this.stopReading();
    if (this.find('password')) {
      this.conversations = this.conversations.filter(other => other !== conversation);
      this.drop(conversation);
      return;
    }
    conversation.role = 'password';
    if (this.pending === null) {
      this.emit('question', text, echoOn);
      return;
    }
    const answer = this.pending;
    this.pending = null;
    conversation.answered = true;
    conversation.session.response(answer);
  }

  private onCompleted(conversation: Conversation, gained: boolean): void {
    conversation.session.disconnectObject(this);
    this.conversations = this.conversations.filter(other => other !== conversation);
    if (gained) {
      this.cancel();
      this.emit('succeeded');
      return;
    }
    if (conversation.role === 'reader') this.stopReading();
    if (conversation.answered) this.emit('failed');
    this.ensure();
  }

  private setFingerprint(state: FingerprintState): void {
    this.fingerprint = state;
    this.emit('fingerprint', state);
  }

  private unwatch(): void {
    this.stopWatching?.();
    this.stopWatching = null;
  }
}
