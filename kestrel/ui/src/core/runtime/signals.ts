import type { SignalMethods } from '../../../../types/gir/gjs.js';
import * as SignalTracker from './signalTracker.js';

export interface EventEmitter extends SignalMethods {}

export class EventEmitter {
  connectObject(...args: unknown[]): void {
    SignalTracker.connectObject(this, ...args);
  }

  disconnectObject(owner: object): void {
    SignalTracker.disconnectObject(this, owner);
  }

  connect_object(...args: unknown[]): void {
    this.connectObject(...args);
  }

  disconnect_object(owner: object): void {
    this.disconnectObject(owner);
  }
}

imports.signals.addSignalMethods(EventEmitter.prototype);
