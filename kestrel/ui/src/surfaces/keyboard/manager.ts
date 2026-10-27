import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../../core/main.js';
import { EventEmitter } from '../../core/runtime/signals.js';
import { Keyboard } from './keyboard.js';

const A11Y_APPLICATIONS_SCHEMA = 'org.gnome.desktop.a11y.applications';
const SHOW_KEYBOARD = 'screen-keyboard-enabled';

interface KeyboardManagerSignals {
  'visibility-changed': () => void;
}

export class KeyboardManager extends EventEmitter {
  declare connect: GObject.SignalMethods<this, KeyboardManagerSignals>['connect'];
  declare emit: GObject.SignalMethods<this, KeyboardManagerSignals>['emit'];

  private keyboard: Keyboard | null = null;
  private lastDevice: Clutter.InputDevice | null = null;
  private readonly a11yApplicationsSettings = new Gio.Settings({ schema_id: A11Y_APPLICATIONS_SCHEMA });
  private readonly seat = global.stage.context.get_backend().get_default_seat();
  private readonly bottomDragGesture = new Shell.EdgeDragGesture({ name: 'OSK show bottom drag' });

  constructor() {
    super();

    this.bottomDragGesture.set_side(St.Side.BOTTOM);
    this.a11yApplicationsSettings.connect('changed', () => this.syncEnabled());
    this.seat.connect('notify::touch-mode', () => this.syncEnabled());

    global.backend.connect('last-device-changed', (_backend, device) => {
      if (device.device_type === Clutter.InputDeviceType.KEYBOARD_DEVICE) return;

      this.lastDevice = device;
      this.syncEnabled();
    });

    const allowedModes = Shell.ActionMode.ALL & ~Shell.ActionMode.LOCK_SCREEN;
    this.bottomDragGesture.connect('may-recognize', () => (allowedModes & Main.actionMode) !== 0 && !KestrelUi.taskbarOwnsBottomEdge());
    this.bottomDragGesture.connect('progress', (_gesture, progress) => this.keyboard?.gestureProgress(progress));
    this.bottomDragGesture.connect('end', () => this.keyboard?.gestureActivate());
    this.bottomDragGesture.connect('cancel', () => this.keyboard?.gestureCancel());
    global.stage.add_action(this.bottomDragGesture);

    this.syncEnabled();
  }

  get keyboardActor(): Keyboard | null {
    return this.keyboard;
  }

  get visible(): boolean {
    return this.keyboard?.showing ?? false;
  }

  open(monitor: number): void {
    Main.layoutManager.keyboardIndex = monitor;
    this.keyboard?.open();
  }

  close(): void {
    this.keyboard?.close();
  }

  addSuggestion(text: string, callback: () => void): void {
    this.keyboard?.addSuggestion(text, callback);
  }

  resetSuggestions(): void {
    this.keyboard?.resetSuggestions();
  }

  setSuggestionsVisible(visible: boolean): void {
    this.keyboard?.setSuggestionsVisible(visible);
  }

  private lastDeviceIsTouchscreen(): boolean {
    return this.lastDevice?.get_device_type() === Clutter.InputDeviceType.TOUCHSCREEN_DEVICE;
  }

  private syncEnabled(): void {
    const enableKeyboard = this.a11yApplicationsSettings.get_boolean(SHOW_KEYBOARD);
    const autoEnabled = this.seat.get_touch_mode() && this.lastDeviceIsTouchscreen();
    const enabled = enableKeyboard || autoEnabled;

    if (enabled && !this.keyboard) {
      const keyboard = new Keyboard();
      keyboard.connect('visibility-changed', () => {
        this.emit('visibility-changed');
        this.bottomDragGesture.enabled = !keyboard.showing;
      });
      this.keyboard = keyboard;
    } else if (!enabled && this.keyboard) {
      this.keyboard.releaseFocusWindow();
      this.keyboard.destroy();
      this.keyboard = null;
      this.bottomDragGesture.enabled = true;
      this.emit('visibility-changed');
    }
  }
}
