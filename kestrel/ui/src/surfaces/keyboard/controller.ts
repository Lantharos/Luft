import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';
import IBus from 'gi://IBus';

import * as Main from '../../core/main.js';
import { EventEmitter } from '../../core/runtime/signals.js';
import { getInputSourceManager, INPUT_SOURCE_TYPE_IBUS, type InputSource } from '../../system/inputSources/keyboard.js';
import { getIBusManager } from '../../system/inputSources/ibusManager.js';

const KEY_RELEASE_TIMEOUT = 50;
const BACKSPACE_WORD_DELETE_THRESHOLD = 50;

interface KeyboardControllerSignals {
  'group-changed': () => void;
  'panel-state': (state: Clutter.InputPanelState) => void;
  'purpose-changed': (purpose: Clutter.InputContentPurpose) => void;
  'content-hints-changed': (hints: Clutter.InputContentHintFlags) => void;
}

function previousWordPosition(text: string, cursor: number): number {
  const upToCursor = [...text].slice(0, cursor).join('');
  const jsStringPos = Math.max(0, upToCursor.search(/\s+\S+\s*$/));
  return GLib.utf8_strlen(text.slice(0, jsStringPos), -1);
}

export class KeyboardController extends EventEmitter {
  declare connect: GObject.SignalMethods<this, KeyboardControllerSignals>['connect'];
  declare emit: GObject.SignalMethods<this, KeyboardControllerSignals>['emit'];

  private readonly virtualDevice = global.stage.context.get_backend().get_default_seat()
    .create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
  private readonly inputSourceManager = getInputSourceManager();
  private currentSource: InputSource;
  private purposeValue: Clutter.InputContentPurpose;
  private oskCompletionEnabled: boolean | null = null;
  private deleteEnabled = false;
  private backspacePressed = false;
  private timesDeleted = 0;
  private surroundingUpdateId = 0;
  private surroundingUpdateTimeoutId = 0;

  constructor() {
    super();

    this.inputSourceManager.connectObject(
      'current-source-changed', () => this.onSourceChanged(),
      'sources-changed', () => this.emit('group-changed'), this);
    this.currentSource = this.inputSourceManager.currentSource!;
    this.purposeValue = Main.inputMethod.content_purpose;

    Main.inputMethod.connectObject(
      'notify::content-purpose', () => {
        this.purposeValue = Main.inputMethod.content_purpose;
        this.emit('purpose-changed', this.purposeValue);
      },
      'notify::content-hints', () => this.emit('content-hints-changed', Main.inputMethod.content_hints),
      'input-panel-state', (_method: unknown, state: Clutter.InputPanelState) => this.emit('panel-state', state), this);
  }

  get purpose(): Clutter.InputContentPurpose {
    return this.purposeValue;
  }

  destroy(): void {
    this.toggleDelete(false);
    this.inputSourceManager.disconnectObject(this);
    Main.inputMethod.disconnectObject(this);
    this.virtualDevice.run_dispose();
  }

  getCurrentGroup(): string {
    if (this.currentSource.id === 'hangul') {
      const { properties } = this.inputSourceManager.currentSource!;
      for (let i = 0, prop; (prop = properties!.get(i)) !== null; ++i) {
        if (prop.get_key() === 'InputMode' &&
          prop.get_prop_type() === IBus.PropType.TOGGLE &&
          prop.get_state() !== IBus.PropState.CHECKED)
          return 'us';
      }
    }

    return this.currentSource.xkbId;
  }

  async commit(text: string, modifiers?: Set<number>): Promise<void> {
    const keyvals = [...text].map(unicode => Clutter.unicode_to_keysym(unicode.codePointAt(0)!));

    if (!Main.inputMethod.currentFocus || (modifiers?.size ?? 0) > 0) {
      if (modifiers) for (const keyval of modifiers) this.keyvalPress(keyval);

      for (const keyval of keyvals) {
        this.keyvalPress(keyval);
        this.keyvalRelease(keyval);
      }

      if (modifiers) for (const keyval of modifiers) this.keyvalRelease(keyval);
      return;
    }

    if (this.oskCompletionEnabled || this.currentSource.type === INPUT_SOURCE_TYPE_IBUS) {
      for (const keyval of keyvals) {
        if (!await Main.inputMethod.handleVirtualKey(keyval)) {
          this.keyvalPress(keyval);
          this.keyvalRelease(keyval);
        }
      }
      return;
    }

    Main.inputMethod.commit(text);
  }

  async setOskCompletion(enabled: boolean): Promise<void> {
    if (this.oskCompletionEnabled === enabled) return;

    this.oskCompletionEnabled = await getIBusManager().setCompletionEnabled(enabled);
    Main.inputMethod.update();
  }

  keyvalPress(keyval: number): void {
    this.virtualDevice.notify_keyval(Clutter.get_current_event_time() * 1000, keyval, Clutter.KeyState.PRESSED);
  }

  keyvalRelease(keyval: number): void {
    this.virtualDevice.notify_keyval(Clutter.get_current_event_time() * 1000, keyval, Clutter.KeyState.RELEASED);
  }

  toggleDelete(enabled: boolean): void {
    if (this.deleteEnabled === enabled) return;

    this.deleteEnabled = enabled;
    this.timesDeleted = 0;

    if (enabled &&
      (!Main.inputMethod.currentFocus ||
        Main.inputMethod.hasPreedit() ||
        this.purposeValue === Clutter.InputContentPurpose.TERMINAL)) {
      this.keyvalPress(Clutter.KEY_BackSpace);
      this.backspacePressed = true;
      return;
    }

    if (!enabled && this.backspacePressed) {
      this.keyvalRelease(Clutter.KEY_BackSpace);
      this.backspacePressed = false;
      return;
    }

    if (!enabled) {
      if (this.surroundingUpdateId > 0) {
        Main.inputMethod.disconnect(this.surroundingUpdateId);
        this.surroundingUpdateId = 0;
      }
      this.clearSurroundingUpdateTimeout();
      return;
    }

    this.surroundingUpdateId = Main.inputMethod.connect('surrounding-text-set', () => {
      const [text, cursor, anchor] = Main.inputMethod.getSurroundingText();
      if (this.timesDeleted === 0) {
        this.deleteSurrounding(text, cursor, anchor);
        return;
      }

      this.clearSurroundingUpdateTimeout();
      this.surroundingUpdateTimeoutId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, KEY_RELEASE_TIMEOUT, () => {
        this.deleteSurrounding(text, cursor, cursor);
        this.surroundingUpdateTimeoutId = 0;
      });
    });

    const [text, cursor, anchor] = Main.inputMethod.getSurroundingText();
    if (text) this.deleteSurrounding(text, cursor, anchor);
    else Main.inputMethod.request_surrounding();
  }

  private onSourceChanged(): void {
    this.currentSource = this.inputSourceManager.currentSource!;
    this.emit('group-changed');
  }

  private clearSurroundingUpdateTimeout(): void {
    if (this.surroundingUpdateTimeoutId === 0) return;
    GLib.source_remove(this.surroundingUpdateTimeoutId);
    this.surroundingUpdateTimeoutId = 0;
  }

  private deleteSurrounding(text: string | null, cursor: number, anchor: number): void {
    if (cursor === 0 && anchor === 0) return;

    let offset: number;
    let len: number;
    if (cursor > anchor) {
      offset = anchor - cursor;
      len = -offset;
    } else if (cursor < anchor) {
      offset = 0;
      len = anchor - cursor;
    } else if (this.timesDeleted < BACKSPACE_WORD_DELETE_THRESHOLD) {
      offset = -1;
      len = 1;
    } else {
      const wordLength = cursor - previousWordPosition(text!, cursor);
      offset = -wordLength;
      len = wordLength;
    }

    this.timesDeleted++;
    Main.inputMethod.delete_surrounding(offset, len);
  }
}
