import Atspi from 'gi://Atspi';
import type GObject from 'gi://GObject';

import { EventEmitter } from '../runtime/signals.js';

const CARET_MOVED = 'object:text-caret-moved';
const STATE_CHANGED = 'object:state-changed';

interface FocusCaretTrackerSignals {
  'focus-changed': (event: Atspi.Event) => void;
  'caret-moved': (event: Atspi.Event) => void;
}

export class FocusCaretTracker extends EventEmitter {
  declare connect: GObject.SignalMethods<this, FocusCaretTrackerSignals>['connect'];
  declare emit: GObject.SignalMethods<this, FocusCaretTrackerSignals>['emit'];

  private readonly atspiListener = Atspi.EventListener.new(event => this.onChanged(event));
  private atspiInited = false;
  private focusListenerRegistered = false;
  private caretListenerRegistered = false;

  private onChanged(event: Atspi.Event): void {
    if (event.type.startsWith(STATE_CHANGED)) this.emit('focus-changed', event);
    else if (event.type === CARET_MOVED) this.emit('caret-moved', event);
  }

  private initAtspi(): boolean {
    if (!this.atspiInited && Atspi.init() === 0) {
      Atspi.set_timeout(250, 250);
      this.atspiInited = true;
    }

    return this.atspiInited;
  }

  registerFocusListener(): void {
    if (!this.initAtspi() || this.focusListenerRegistered) return;

    this.atspiListener.register(`${STATE_CHANGED}:focused`);
    this.atspiListener.register(`${STATE_CHANGED}:selected`);
    this.focusListenerRegistered = true;
  }

  registerCaretListener(): void {
    if (!this.initAtspi() || this.caretListenerRegistered) return;

    this.atspiListener.register(CARET_MOVED);
    this.caretListenerRegistered = true;
  }

  deregisterFocusListener(): void {
    if (!this.focusListenerRegistered) return;

    this.atspiListener.deregister(`${STATE_CHANGED}:focused`);
    this.atspiListener.deregister(`${STATE_CHANGED}:selected`);
    this.focusListenerRegistered = false;
  }

  deregisterCaretListener(): void {
    if (!this.caretListenerRegistered) return;

    this.atspiListener.deregister(CARET_MOVED);
    this.caretListenerRegistered = false;
  }
}
