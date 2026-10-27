import type GObject from 'gi://GObject';

import * as KestrelUi from '../../kestrelUi.js';
import * as Signals from '../runtime/signals.js';
import { Authentication } from './authentication.js';
import { connectAuthenticator } from './greetd.js';

const RESTARTS = 1;

interface FingerprintSignals {
  succeeded: () => void;
  hint: (hint: string | null) => void;
}

export class FingerprintAuthentication extends Signals.EventEmitter {
  declare connect: GObject.SignalMethods<this, FingerprintSignals>['connect'];
  declare emit: GObject.SignalMethods<this, FingerprintSignals>['emit'];

  private readonly authentication = new Authentication(connectAuthenticator, { mode: 'fingerprint' });
  private userName = '';
  private instruction: string | null = null;
  private listening = false;
  private restarts = 0;

  constructor() {
    super();
    this.authentication.connectObject(
      'question', () => this.stop(null),
      'message', (_: Authentication, text: string, isError: boolean) => this.onMessage(text, isError),
      'failed', () => this.onFailed(),
      'succeeded', () => this.emit('succeeded'),
      this);
  }

  begin(userName: string): void {
    this.userName = userName;
    this.instruction = null;
    this.restarts = 0;
    this.start();
  }

  cancel(): void {
    this.listening = false;
    this.authentication.cancel();
  }

  destroy(): void {
    this.authentication.destroy();
  }

  private start(): void {
    this.listening = false;
    this.authentication.begin(this.userName);
  }

  private stop(hint: string | null): void {
    this.cancel();
    this.emit('hint', hint);
  }

  private onMessage(text: string, isError: boolean): void {
    if (isError) {
      if (this.listening) {
        KestrelUi.playSound('error');
        this.emit('hint', KestrelUi.t('fingerprint-not-recognized'));
      } else {
        this.stop(null);
      }
      return;
    }

    this.listening = true;
    if (text === this.instruction) return;
    this.instruction = text;
    this.emit('hint', text);
  }

  private onFailed(): void {
    if (!this.listening) {
      this.stop(null);
      return;
    }

    KestrelUi.playSound('error');
    if (this.restarts < RESTARTS) {
      this.restarts++;
      this.emit('hint', KestrelUi.t('fingerprint-not-recognized'));
      this.start();
    } else {
      this.stop(KestrelUi.t('fingerprint-not-recognized'));
    }
  }
}
