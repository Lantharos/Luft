import type GObject from 'gi://GObject';
import type IBus from 'gi://IBus';

import { EventEmitter } from '../../runtime/signals.js';
import { getIBusManager } from '../../input/ibusManager.js';

export const INPUT_SOURCE_TYPE_XKB = 'xkb';
export const INPUT_SOURCE_TYPE_IBUS = 'ibus';

interface InputSourceSignals {
  'changed': () => void;
  'activate': (interactive: boolean) => void;
}

function xkbIdFor(id: string): string {
  const engineDesc = getIBusManager().getEngineDesc(id);
  return engineDesc ? engineDesc.layout : id;
}

export class InputSource extends EventEmitter {
  declare connect: GObject.SignalMethods<this, InputSourceSignals>['connect'];
  declare emit: GObject.SignalMethods<this, InputSourceSignals>['emit'];

  properties: IBus.PropList | null = null;
  readonly xkbId: string;
  private currentShortName: string;

  constructor(readonly type: string, readonly id: string, readonly displayName: string, shortName: string, readonly index: number) {
    super();
    this.currentShortName = shortName.toUpperCase();
    this.xkbId = xkbIdFor(id);
  }

  get shortName(): string {
    return this.currentShortName;
  }

  set shortName(shortName: string) {
    this.currentShortName = shortName;
    this.emit('changed');
  }

  activate(interactive: boolean): void {
    this.emit('activate', interactive);
  }
}
